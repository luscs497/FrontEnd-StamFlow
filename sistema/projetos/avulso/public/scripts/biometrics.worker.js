/* biometrics.worker.js - Processamento Matemático Puro (Calibrado 4s) */

const EXPRESSIONS = ['neutral','happy','sad','angry'];
const WEIGHTS = new Float32Array([0.05, 0.25, -0.10, -0.20]); 
const FIXED_SMOOTHING = 0.20; 

const BOOST_DURATION_MS = 60000;
const BOOST_PERCENT = 15; 

// Configuração de Pesos para Normalização
let maxRaw = 0, minRaw = 0;
for (let i = 0; i < WEIGHTS.length; i++) {
    const v = WEIGHTS[i];
    if (v > 0) maxRaw += v; else minRaw += v;
}
if (maxRaw === 0 && minRaw === 0) { maxRaw = 1; minRaw = 0; }

// Buffers de Estado
const ema = new Float32Array(4); 
const sustainStart = new Float64Array(4);
const activeContrib = new Uint8Array(4);

// Novas variáveis para controlar tempo de sustentação de negatividade
let negativeSustainStart = 0;

// Variáveis de Boost e Calibração
let boostActive = 0;
let boostExpiresAt = 0;
let happySustainStartForBoost = 0;

// [IMPORTANTE] Guarda os ângulos brutos do último frame para calibração precisa
let lastRawMetrics = { shoulderAngle: 0, headPitch: 0, neckYaw: 0, backAngle: 0 };
let calibrationOffsets = { shoulder: 0, head: 0, rotation: 0, back: 0 };
let currentPostureScore = 100;

// Suavização de Métricas de Postura
const smootherAlphas = new Float32Array([0.25, 0.2, 0.25, 0.2]);
const smootherValues = new Float32Array([NaN, NaN, NaN, NaN]);

// --- Funções Auxiliares Matemáticas ---
const toDeg = r => r * 57.29577951308232;
const safeAcosDeg = (v) => {
    if (v <= -1) return 180;
    if (v >= 1) return 0;
    return Math.acos(v) * 57.29577951308232;
};

function smootherUpdate(indexAlphaIdx, v) {
    if (v == null || isNaN(v)) return NaN;
    const a = smootherAlphas[indexAlphaIdx];
    let cur = smootherValues[indexAlphaIdx];
    if (isNaN(cur)) {
        smootherValues[indexAlphaIdx] = v;
        return v;
    }
    return a * v + (1 - a) * cur;
}

// --- Lógica de Postura ---
function computePostureFromBuffers(poseBuf, poseCount, faceBuf, faceCount) {
    if (!poseBuf || !faceBuf || poseCount <= 12 || faceCount <= 152) return null;

    const pose = new Float32Array(poseBuf);
    const face = new Float32Array(faceBuf);
    const pi = (i) => i * 3;

    // Extração de Pontos Chave
    const b11 = pi(11), b12 = pi(12); // Ombros
    const lShx = pose[b11], lShy = pose[b11+1];
    const rShx = pose[b12], rShy = pose[b12+1];

    const b1 = pi(1), b10 = pi(10), b152 = pi(152); // Face
    const nosex = face[b1], nosey = face[b1+1], nosez = face[b1+2];
    const foreY = face[b10+1], foreZ = face[b10+2];
    const chinY = face[b152+1], chinZ = face[b152+2];

    // Cálculos de Ângulos (Raw)
    const shoulderAngle = Math.abs(toDeg(Math.atan2(rShy - lShy, rShx - lShx)));
    const headPitch = Math.abs(toDeg(Math.atan2(foreZ - chinZ, foreY - chinY)));
    
    const midShx = (lShx + rShx) * 0.5;
    const midShz = (pose[b11+2] + pose[b12+2]) * 0.5;
    const neckYaw = Math.abs(toDeg(Math.atan2(nosex - midShx, (midShz - nosez) || 1e-6)));

    const midShy = (lShy + rShy) * 0.5;
    const b23 = pi(23), b24 = pi(24);
    const midHipx = (pose[b23] + pose[b24]) * 0.5;
    const midHipy = (pose[b23+1] + pose[b24+1]) * 0.5;
    const midHipz = (pose[b23+2] + pose[b24+2]) * 0.5;

    const tvx = midHipx - midShx, tvy = midHipy - midShy, tvz = midHipz - midShz;
    const nvx = nosex - midShx, nvy = nosey - midShy, nvz = nosez - midShz;
    
    const dot = tvx * nvx + tvy * nvy + tvz * nvz;
    const magT = Math.hypot(tvx, tvy, tvz) || 1e-9;
    const magN = Math.hypot(nvx, nvy, nvz) || 1e-9;
    const backAngle = Math.abs(safeAcosDeg(dot / (magT * magN)) * 2.0);

    return { shoulderAngle, headPitch, neckYaw, backAngle };
}

// --- Classificação para UI (Visual apenas) ---
const CLASSIFICATION_RULES = {
    shoulder: { perfeito: 1, bom: 3,  ruim: 5 },
    head:     { perfeito: 2, bom: 4, ruim: 5 },
    rotation: { perfeito: 2, bom: 4, ruim: 5 },
    back:     { perfeito: 7, bom: 10, ruim: 12 } 
};

function classifyMetricVal(metricName, v) {
    const deviation = Math.abs(v || 0);
    const r = CLASSIFICATION_RULES[metricName];
    
    let label, scoreRatio;

    if (deviation <= r.perfeito) { 
        label = 'Perfeito'; scoreRatio = 1; 
    } else if (deviation <= r.bom) { 
        label = 'Bom'; scoreRatio = 0.75; 
    } else if (deviation <= r.ruim) { 
        label = 'Ruim'; scoreRatio = 0.35; 
    } else { 
        label = 'Crítico'; scoreRatio = 0; 
    }

    return { label, score: scoreRatio, value: Number(deviation.toFixed(2)) };
}

function classifyMetricsSimpleJSON(metrics) {
    return {
        shoulder: classifyMetricVal('shoulder', metrics.shoulder || 0),
        head:     classifyMetricVal('head',     metrics.head || 0),
        rotation: classifyMetricVal('rotation', metrics.rotation || 0),
        back:     classifyMetricVal('back',     metrics.back || 0)
    };
}

// --- Handlers de Mensagem ---
onmessage = (ev) => {
    const d = ev.data;
    const now = performance.now();
    if (!d) return;

    // 1. Processar Landmarks (Postura)
    if (d.type === 'landmarks') {
        let poseBuf = d.poseBuffer || (d.pose ? new Float32Array(d.pose).buffer : null);
        let faceBuf = d.faceBuffer || (d.face ? new Float32Array(d.face).buffer : null);
        
        let poseCount = d.poseCount || (d.pose ? d.pose.length / 3 : 0);
        let faceCount = d.faceCount || (d.face ? d.face.length / 3 : 0);

        const metrics = computePostureFromBuffers(poseBuf, poseCount, faceBuf, faceCount);
        
        if (!metrics) {
            postMessage({ type: 'postureMetrics', metrics: null });
            return;
        }

        lastRawMetrics = metrics;

        const rawAdj = {
            shoulder: metrics.shoulderAngle - calibrationOffsets.shoulder,
            head:     metrics.headPitch - calibrationOffsets.head,
            rotation: metrics.neckYaw - calibrationOffsets.rotation,
            back:     metrics.backAngle - calibrationOffsets.back
        };

        const sS = smootherUpdate(0, rawAdj.shoulder);
        const sH = smootherUpdate(1, rawAdj.head);
        const sR = smootherUpdate(2, rawAdj.rotation);
        const sB = smootherUpdate(3, rawAdj.back);

        const scoreS = classifyMetricVal('shoulder', sS).score;
        const scoreH = classifyMetricVal('head', sH).score;
        const scoreR = classifyMetricVal('rotation', sR).score;
        const scoreB = classifyMetricVal('back', sB).score;
        
        currentPostureScore = Math.round(((scoreS + scoreH + scoreR + scoreB) / 4) * 100);

        postMessage({
            type: 'postureMetrics',
            metrics: { shoulder: sS, head: sH, rotation: sR, back: sB }
        });
        return;
    }

    // 2. Processar Expressões (Emoção) - [AJUSTADO 4s/2%]
    if (d.type === 'expressions') {
        let expr = d.exprBuffer ? new Float32Array(d.exprBuffer) : (d.expressions ? new Float32Array(d.expressions) : null);
        if (!expr) return;

        for (let i = 0; i < 4; i++) {
            const v = expr[i] || 0;
            const p = FIXED_SMOOTHING * ema[i] + (1 - FIXED_SMOOTHING) * v;
            ema[i] += (p - ema[i]); 
        }

        // --- BOOST ALEGRIA (4s) ---
        if ((expr[1] || 0) >= 0.60) {
            if (happySustainStartForBoost === 0) happySustainStartForBoost = now;
            // Aumentado para 4000ms
            if (now - happySustainStartForBoost >= 4000) {
                boostExpiresAt = now + BOOST_DURATION_MS;
                boostActive = 1;
            }
        } else { happySustainStartForBoost = 0; }
        
        if (boostExpiresAt < now) { boostActive = 0; boostExpiresAt = 0; }

        let raw = 0;
        for (let i = 0; i < 4; i++) raw += ema[i] * WEIGHTS[i];
        
        let base = (maxRaw === minRaw) ? (raw > maxRaw ? 100 : 0) : Math.round(((raw - minRaw) / (maxRaw - minRaw)) * 100);
        
        // --- PENALIDADE NEGATIVIDADE (4s > 2%) ---
        const neg = ema[2] + ema[3]; // Sad + Angry
        
        if (neg > 0.02) {
            if (negativeSustainStart === 0) negativeSustainStart = now;
            
            // Só aplica penalidade se sustentar por 4 segundos
            if (now - negativeSustainStart > 4000) {
                // Penalidade leve
                base = base * 0.9;
                // Penalidade pesada se for muito intenso
                if (neg > 0.3) base = base * 0.5;
            }
        } else {
            negativeSustainStart = 0;
        }

        const boostedEmotion = Math.min(100, Math.round(base + (boostActive ? BOOST_PERCENT : 0)));
        const finalWeighted = Math.round((currentPostureScore * 0.7) + (boostedEmotion * 0.3));

        postMessage({
            type: 'emotionState',
            final: finalWeighted,
            emotionRaw: boostedEmotion,
            postureRaw: currentPostureScore,
            ema: { neutral: ema[0], happy: ema[1], sad: ema[2], angry: ema[3] },
            boostActive: !!boostActive,
            boostExpiresAt
        });
        return;
    }

    if (d.type === 'classifyMetrics') {
        const classification = d.metrics ? classifyMetricsSimpleJSON(d.metrics) : null;
        postMessage({ type: 'postureClassification', id: d.id, classification });
        return;
    }

    if (d.type === 'calibrate') {
        calibrationOffsets.shoulder = lastRawMetrics.shoulderAngle;
        calibrationOffsets.head     = lastRawMetrics.headPitch;
        calibrationOffsets.rotation = lastRawMetrics.neckYaw;
        calibrationOffsets.back     = lastRawMetrics.backAngle;
        smootherValues.fill(NaN); 
        postMessage({ type: 'calibrationSuccess', offsets: calibrationOffsets });
        return;
    }

    if (d.type === 'setCalibration' && d.offsets) {
        calibrationOffsets.shoulder = d.offsets.shoulder || 0;
        calibrationOffsets.head     = d.offsets.head || 0;
        calibrationOffsets.rotation = d.offsets.rotation || 0;
        calibrationOffsets.back     = d.offsets.back || 0;
        smootherValues.fill(NaN);
        postMessage({ type: 'calibrationLoaded' });
        return;
    }
};