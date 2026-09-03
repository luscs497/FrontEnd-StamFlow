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

// Calibrar com UM único frame herdava todo o ruído daquele frame como offset
// permanente da sessão — e num ângulo ruidoso isso sozinho já valia vários
// graus de erro fixo, suficiente para derrubar a métrica uma faixa inteira.
// Guardamos as últimas amostras brutas e calibramos pela MÉDIA delas: o erro
// do offset cai pela raiz de N (~5x com 24 amostras). São ~2s de histórico a
// 12fps, já acumulados quando o usuário clica — a calibração segue instantânea.
const CALIBRATION_SAMPLES = 24;
const calibrationBuffer = [];

/*
 * MEDIA APARADA, no lugar da media simples.
 *
 * A media simples nao tem defesa contra outlier. O MediaPipe solta, de vez em
 * quando, um quadro com tracking perdido ou landmark ocluido; um unico desses
 * com 20 graus de erro entre 24 amostras desloca a baseline em 0,83 grau — e
 * esse desvio fica FIXO para a sessao inteira, porque a calibracao acontece
 * uma vez so.
 *
 * A aparagem descarta as 4 maiores e as 4 menores leituras de CADA metrica
 * (independentemente umas das outras: o quadro ruim para o ombro nao costuma
 * ser o mesmo que e ruim para a rotacao) e promedia as 16 do meio. Isso
 * mantem a reducao de variancia da media — o erro-padrao continua caindo com
 * a raiz de N — e ganha a robustez da mediana: aguenta ate 4 outliers por
 * ponta sem mover o resultado.
 *
 * Custo: quatro sorts de 24 numeros, UMA VEZ por calibracao. Nada.
 *
 * CALIBRATION_SAMPLES continua 24 e a cadencia de 83ms que enche o buffer
 * continua a mesma — a Fase 16 nao e tocada aqui.
 */
const APARA_POR_PONTA = 4;

function mediaAparada(valores) {
    const n = valores.length;
    if (n === 0) return 0;
    // Precisa sobrar pelo menos 4 no meio para a aparagem valer a pena.
    const corte = n >= 12 ? APARA_POR_PONTA : 0;
    const ordenados = valores.slice().sort((a, b) => a - b);
    const meio = ordenados.slice(corte, n - corte);
    let soma = 0;
    for (let i = 0; i < meio.length; i++) soma += meio[i];
    return soma / meio.length;
}

function averageRawMetrics() {
    if (calibrationBuffer.length === 0) return lastRawMetrics;
    const sA = [], hP = [], nY = [], bA = [];
    for (let i = 0; i < calibrationBuffer.length; i++) {
        sA.push(calibrationBuffer[i].shoulderAngle);
        hP.push(calibrationBuffer[i].headPitch);
        nY.push(calibrationBuffer[i].neckYaw);
        bA.push(calibrationBuffer[i].backAngle);
    }
    return {
        shoulderAngle: mediaAparada(sA),
        headPitch:     mediaAparada(hP),
        neckYaw:       mediaAparada(nY),
        backAngle:     mediaAparada(bA)
    };
}

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
const safeAsinDeg = (v) => {
    if (v <= -1) return -90;
    if (v >= 1) return 90;
    return Math.asin(v) * 57.29577951308232;
};

function smootherUpdate(indexAlphaIdx, v) {
    if (v == null || isNaN(v)) return NaN;
    const a = smootherAlphas[indexAlphaIdx];
    let cur = smootherValues[indexAlphaIdx];
    if (isNaN(cur)) {
        smootherValues[indexAlphaIdx] = v;
        return v;
    }
    // O EMA precisa GUARDAR o valor suavizado: sem isso `cur` fica preso no
    // primeiro desvio lido depois da calibracao e a metrica nunca converge
    // para a postura atual (ficava em ~75-80% de um valor congelado, o que
    // travava a Stamina em Critica/Atencao mesmo com a postura correta).
    const next = a * v + (1 - a) * cur;
    smootherValues[indexAlphaIdx] = next;
    return next;
}

// --- Lógica de Postura ---
/*
 * Os ângulos saem daqui COM SINAL (exceto o pitch, ver abaixo). Aplicar
 * Math.abs() antes da calibração retificava o ruído: um valor que oscila em
 * torno de 0 vira sempre positivo, ganha uma média maior que zero e a
 * subtração do offset deixa de cancelar. Quem retifica agora é o
 * classifyMetricVal, que já usa Math.abs no desvio JÁ calibrado — aí o sinal
 * cancela certinho e ainda diz para que lado o usuário está desviando.
 */
function computePostureFromBuffers(poseBuf, poseCount, faceBuf, faceCount) {
    if (!poseBuf || !faceBuf || poseCount <= 12 || faceCount <= 152) return null;

    const pose = new Float32Array(poseBuf);
    const face = new Float32Array(faceBuf);
    const pi = (i) => i * 3;

    // Pose: 0 nariz | 3 e 6 cantos externos dos olhos | 7 e 8 orelhas | 11 e 12 ombros
    const b11 = pi(11), b12 = pi(12);
    const lShx = pose[b11], lShy = pose[b11+1];
    const rShx = pose[b12], rShy = pose[b12+1];
    const midShx = (lShx + rShx) * 0.5;
    const midShy = (lShy + rShy) * 0.5;

    // Face: 10 testa | 152 queixo
    const b10 = pi(10), b152 = pi(152);
    const foreY = face[b10+1], foreZ = face[b10+2];
    const chinY = face[b152+1], chinZ = face[b152+2];

    // --- 1) OMBROS: inclinação da linha entre os dois ombros. Já era 2D puro.
    const shoulderAngle = toDeg(Math.atan2(rShy - lShy, rShx - lShx));

    // --- 2) CABEÇA (pitch/flexão): inalterado. É o único que ainda usa Z, mas
    // aqui os dois Z vêm do MESMO espaço (o face mesh), então a razão é
    // consistente. O Math.abs continua porque em repouso este ângulo fica perto
    // de 180°, justamente onde o atan2 é descontínuo — o abs é o que evita o
    // salto de ~360° quando o numerador cruza zero.
    const headPitch = Math.abs(toDeg(Math.atan2(foreZ - chinZ, foreY - chinY)));

    // --- 3) ROTAÇÃO (yaw): assimetria nariz <-> orelhas, 100% no eixo X.
    // A fórmula antiga dividia por (Z dos ombros − Z do nariz): além de ser um
    // valor minúsculo e ruidoso, misturava DOIS espaços diferentes — o Z do
    // pose é relativo ao quadril, o da face é relativo ao centro da cabeça.
    // Perto de zero o quociente explodia e, ao trocar de sinal, o atan2 saltava
    // para ~180°: o falso "Crítico" que travava a Stamina.
    // Agora: de frente as duas distâncias nariz-orelha são iguais (razão 0);
    // girando a cabeça uma cresce e a outra encolhe (razão -> ±1). Normalizar
    // pela soma torna a medida imune à distância do usuário até a câmera.
    const noseX = pose[pi(0)];
    let dL = noseX - pose[pi(7)];        // nariz -> orelha esquerda
    let dR = pose[pi(8)] - noseX;        // orelha direita -> nariz
    if (Math.abs(dL) + Math.abs(dR) < 1e-4) {
        // Orelhas degeneradas (perfil fechado, oclusão): cai para os cantos
        // externos dos olhos, que têm a mesma geometria com base menor.
        dL = noseX - pose[pi(3)];
        dR = pose[pi(6)] - noseX;
    }
    const yawBase = Math.abs(dL) + Math.abs(dR);
    const neckYaw = yawBase > 1e-6 ? safeAsinDeg((dL - dR) / yawBase) : 0;

    // --- 4) TRONCO: eixo ombros -> cabeça medido contra a vertical da imagem.
    // A fórmula antiga partia do quadril, que fica FORA do quadro numa webcam
    // de mesa — o MediaPipe extrapola esses pontos, e o ruído deles entrava
    // inteiro na conta e ainda era DOBRADO pelo `* 2.0`. Sem quadril, sem Z e
    // sem multiplicador: o vetor vai do meio dos ombros ao meio das orelhas
    // (mais estável que o nariz, que se mexe com a expressão facial) e o ângulo
    // é medido contra um eixo Y perfeitamente reto. 0° = coluna alinhada.
    const midEarX = (pose[pi(7)] + pose[pi(8)]) * 0.5;
    const midEarY = (pose[pi(7)+1] + pose[pi(8)+1]) * 0.5;
    const backAngle = toDeg(Math.atan2(midEarX - midShx, midShy - midEarY));

    return { shoulderAngle, headPitch, neckYaw, backAngle };
}

// --- Classificação para UI (Visual apenas) ---
/*
 * Tolerâncias em GRAUS DE DESVIO em relação à postura calibrada.
 *
 * As anteriores (ombros "Perfeito" só até 1°, cabeça e rotação até 2°) eram
 * mais apertadas que o próprio ruído do detector: exigiam um congelamento
 * robótico na cadeira e, na prática, ninguém sustentava "Perfeito" nas quatro
 * ao mesmo tempo — o teto real da Stamina ficava travado. As faixas agora são
 * ergonômicas, não milimétricas, e ficam bem acima do ruído residual medido
 * (~0,4° nos ombros e no tronco, ~1,8° na rotação depois da suavização).
 *
 * `back` mudou de escala junto com a fórmula: o ângulo não é mais dobrado nem
 * medido a partir do quadril, então os antigos 7/10/12 não valiam mais.
 */
const CLASSIFICATION_RULES = {
    shoulder: { perfeito: 3, bom: 7,  ruim: 12 },
    head:     { perfeito: 5, bom: 12, ruim: 20 },
    rotation: { perfeito: 6, bom: 15, ruim: 25 },
    back:     { perfeito: 5, bom: 12, ruim: 20 }
};

/*
 * scoreRatio alinhado ao backend: Perfeito=100, Bom=75, Ruim=50, Crítico=25.
 * Antes o "Ruim" valia 0,35 e o "Crítico" valia 0 — uma única articulação
 * crítica derrubava um quarto inteiro da nota e, combinada com as tolerâncias
 * apertadas acima, era o que impedia a Stamina de chegar a "Excelente".
 */
/* =========================================================================
 * ZONA MORTA
 *
 * Ancora a vizinhanca imediata da baseline em "Perfeito". Sem ela, um usuario
 * cuja calibracao ficou levemente deslocada opera colado num limiar, e o ruido
 * residual do detector (que o EMA reduz mas nao elimina) fica atravessando o
 * degrau para os dois lados.
 *
 * D = metade da faixa "Perfeito" de cada metrica, derivado das PROPRIAS
 * CLASSIFICATION_RULES para que nunca saia de sincronia com elas:
 *     ombro 1,5°   cabeca 2,5°   rotacao 3,0°   tronco 2,5°
 *
 * EFEITO COLATERAL, DECLARADO: como D cabe inteiro dentro da faixa "Perfeito",
 * subtrai-lo antes de classificar desloca TODOS os limiares para cima. Na
 * pratica a faixa "Perfeito" passa a valer:
 *     ombro 4,5°   cabeca 7,5°   rotacao 9,0°   tronco 7,5°
 * e as faixas Bom/Ruim/Critico deslocam o mesmo tanto. Nao existe zona morta
 * que ajude e ao mesmo tempo deixe as tolerancias intactas: se ela coubesse
 * dentro do "Perfeito" sem deslocar nada, seria um no-op, porque tudo ali ja
 * era "Perfeito". As CLASSIFICATION_RULES em si nao foram tocadas.
 * ========================================================================= */
const ZONA_MORTA = {
    shoulder: CLASSIFICATION_RULES.shoulder.perfeito * 0.5,
    head:     CLASSIFICATION_RULES.head.perfeito     * 0.5,
    rotation: CLASSIFICATION_RULES.rotation.perfeito * 0.5,
    back:     CLASSIFICATION_RULES.back.perfeito     * 0.5
};

function desvioUtil(metricName, v) {
    const bruto = Math.abs(v || 0);
    const d = ZONA_MORTA[metricName] || 0;
    return bruto <= d ? 0 : bruto - d;
}

const NIVEIS = [
    { label: 'Perfeito', score: 1    },
    { label: 'Bom',      score: 0.75 },
    { label: 'Ruim',     score: 0.50 },
    { label: 'Crítico',  score: 0.25 }
];

function nivelCru(metricName, desvio) {
    const r = CLASSIFICATION_RULES[metricName];
    if (desvio <= r.perfeito) return 0;
    if (desvio <= r.bom)      return 1;
    if (desvio <= r.ruim)     return 2;
    return 3;
}

function classifyMetricVal(metricName, v) {
    const desvio = desvioUtil(metricName, v);
    const n = nivelCru(metricName, desvio);
    // `value` continua sendo o desvio BRUTO, para nao mudar o significado de um
    // campo que ja existia (ninguem o le hoje, mas ele serve de diagnostico).
    return { label: NIVEIS[n].label, score: NIVEIS[n].score, value: Number(Math.abs(v || 0).toFixed(2)) };
}

/* =========================================================================
 * HISTERESE ASSIMETRICA
 *
 * A nota de postura e a media de quatro scoreRatio que so assumem
 * {1; 0,75; 0,50; 0,25}, entao ela so pode cair em 13 valores e UMA metrica
 * cruzando UM limiar move a nota 6,25 pontos de uma vez. Como a quantizacao
 * acontece DEPOIS do EMA, suavizar o angulo nao suaviza a nota: um valor
 * suavizado oscilando entre 2,98° e 3,02° em torno do limiar de 3° produz o
 * pisca-pisca 100 -> 93,75 -> 100.
 *
 * A saida e tornar a fronteira assimetrica:
 *   - PIORAR usa o limiar cheio (reage na hora, seguranca em primeiro lugar);
 *   - MELHORAR exige 80% do limiar do nivel de destino.
 * Para voltar a "Perfeito" no ombro nao basta cair abaixo de 3°: e preciso
 * chegar a 2,4°. A banda morta de 0,6° entre subir e descer e o que impede a
 * oscilacao de atravessar de novo.
 *
 * A promocao desce um nivel por vez, cada um com a sua propria folga, para que
 * uma queda grande de desvio (de Critico direto para perto de zero) ainda
 * chegue a Perfeito no mesmo quadro.
 *
 * O estado e resetado junto com os suavizadores em toda (re)calibracao: a
 * baseline mudou, entao a memoria do nivel anterior perdeu o sentido.
 * ========================================================================= */
const HISTERESE = 0.8;
const _nivelAnterior = { shoulder: null, head: null, rotation: null, back: null };

function resetarHisterese() {
    _nivelAnterior.shoulder = null;
    _nivelAnterior.head = null;
    _nivelAnterior.rotation = null;
    _nivelAnterior.back = null;
}

function classifyComHisterese(metricName, v) {
    const r = CLASSIFICATION_RULES[metricName];
    const desvio = desvioUtil(metricName, v);
    const cru = nivelCru(metricName, desvio);
    const anterior = _nivelAnterior[metricName];

    let n;
    if (anterior === null || cru > anterior) {
        // Primeira leitura, ou piorou: aceita direto, no limiar cheio.
        n = cru;
    } else {
        // Melhorou: sobe um degrau de cada vez, cada um com a sua folga.
        const limiares = [r.perfeito, r.bom, r.ruim];
        n = anterior;
        while (n > 0 && desvio <= limiares[n - 1] * HISTERESE) n--;
    }

    _nivelAnterior[metricName] = n;
    return { label: NIVEIS[n].label, score: NIVEIS[n].score, value: Number(Math.abs(v || 0).toFixed(2)) };
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
        calibrationBuffer.push(metrics);
        if (calibrationBuffer.length > CALIBRATION_SAMPLES) calibrationBuffer.shift();

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

        // C5 — guarda o objeto inteiro em vez de so o .score. Sao as MESMAS
        // quatro chamadas de classifyMetricVal com as MESMAS entradas de
        // antes; o que muda e que os rotulos deixam de ser descartados e vao
        // junto no postMessage, poupando um round-trip completo por quadro.
        // Identico, por construcao, ao que classifyMetricsSimpleJSON({shoulder:
        // sS, head: sH, rotation: sR, back: sB}) devolvia no caminho antigo.
        // Com histerese: e este o caminho que alimenta a nota exibida.
        const cS = classifyComHisterese('shoulder', sS);
        const cH = classifyComHisterese('head', sH);
        const cR = classifyComHisterese('rotation', sR);
        const cB = classifyComHisterese('back', sB);

        currentPostureScore = Math.round(((cS.score + cH.score + cR.score + cB.score) / 4) * 100);

        postMessage({
            type: 'postureMetrics',
            metrics: { shoulder: sS, head: sH, rotation: sR, back: sB },
            classification: { shoulder: cS, head: cH, rotation: cR, back: cB },
            // Quem manda no numero de amostras da calibracao continua sendo
            // este arquivo. O camera.js so obedece a este sinal para disparar a
            // auto-calibracao pos-onboarding com o buffer JA cheio, mantendo a
            // media de CALIBRATION_SAMPLES da Fase 16 intacta.
            calibReady: calibrationBuffer.length >= CALIBRATION_SAMPLES
        });
        return;
    }

    // 2. Processar Expressões (Emoção) - [AJUSTADO 4s/2%]
    if (d.type === 'expressions') {
        let expr = d.exprBuffer ? new Float32Array(d.exprBuffer) : (d.expressions ? new Float32Array(d.expressions) : null);
        if (!expr) return;

        // EMA da emocao — pesos CORRIGIDOS.
        //
        // Estava `FIXED_SMOOTHING * ema + (1 - FIXED_SMOOTHING) * v`, ou seja o
        // historico pesava 0,20 e o quadro novo 0,80. Isso e o INVERSO da
        // convencao usada na postura (`a * novo + (1 - a) * antigo`, com a
        // entre 0,20 e 0,25) e deixava o filtro praticamente inerte: reduzia o
        // desvio-padrao do ruido em apenas 18%, contra 62 a 67% na postura. Era
        // o que fazia os percentuais de Humor piscarem.
        //
        // Agora o historico pesa 0,80 e o quadro novo 0,20 — mesma reducao de
        // ruido dos suavizadores de postura (fator 0,33, ou seja -67%).
        // A CONSTANTE nao mudou: FIXED_SMOOTHING continua 0,20, e agora ela
        // significa o que o nome diz. O `ema[i] += (p - ema[i])` tambem saiu:
        // era uma forma rebuscada de escrever `ema[i] = p`.
        for (let i = 0; i < 4; i++) {
            const v = expr[i] || 0;
            ema[i] = FIXED_SMOOTHING * v + (1 - FIXED_SMOOTHING) * ema[i];
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
        // Pesos da Stamina: 90% postura, 10% emocao (fase 14). Este e o
        // calculo de verdade; o texto do modal "Como melhorar minha Stamina"
        // ja fala em 90/10 desde o mesmo commit e agora bate com a conta.
        const finalWeighted = Math.round((currentPostureScore * 0.9) + (boostedEmotion * 0.1));

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
        // Média das últimas amostras, não o último frame solto.
        const base = averageRawMetrics();
        calibrationOffsets.shoulder = base.shoulderAngle;
        calibrationOffsets.head     = base.headPitch;
        calibrationOffsets.rotation = base.neckYaw;
        calibrationOffsets.back     = base.backAngle;
        // Zerar (em vez de NaN) faz o suavizador partir do desvio ESPERADO logo
        // após calibrar, que é 0. Com NaN ele adotava o primeiro frame seguinte
        // como ponto de partida — e esse frame é justamente o de depois do
        // alert(), quando o usuário já se mexeu para fechar a caixa.
        smootherValues.fill(0);
        resetarHisterese();
        postMessage({
            type: 'calibrationSuccess',
            offsets: calibrationOffsets,
            samples: calibrationBuffer.length
        });
        return;
    }

    if (d.type === 'setCalibration' && d.offsets) {
        calibrationOffsets.shoulder = d.offsets.shoulder || 0;
        calibrationOffsets.head     = d.offsets.head || 0;
        calibrationOffsets.rotation = d.offsets.rotation || 0;
        calibrationOffsets.back     = d.offsets.back || 0;
        smootherValues.fill(0);
        resetarHisterese();
        postMessage({ type: 'calibrationLoaded' });
        return;
    }
};