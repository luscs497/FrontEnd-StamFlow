/* scripts/camera.js - Controle de Câmera, Feedback Visual, Telemetria e Notificações */

const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('output');
const canvasCtx = canvasElement.getContext('2d');
const statusEl = document.getElementById('status');

/* Elementos de UI */
const uiHumorTotal = document.getElementById('val-humor-total');
const uiPostureTotal = document.getElementById('resultado-geral-postura');
const uiStaminaBar = document.getElementById('stamina-preenchida');
const uiBoostBadge = document.getElementById('boostCountdown');

const uiEmotions = {
  neutral: document.getElementById('val-neutral'),
  happy:   document.getElementById('val-happy'),
  sad:     document.getElementById('val-sad'),
  angry:   document.getElementById('val-angry')
};

const uiClassification = {
  shoulder: document.getElementById('class-shoulder'),
  head:     document.getElementById('class-head'),
  rotation: document.getElementById('class-rotation'),
  back:     document.getElementById('class-back')
};

/* Web Worker */
const bgWorker = new Worker('/scripts/biometrics.worker.js');

/* Controle de Taxa de Envio */
const POSTURE_SEND_INTERVAL_MS = 83; // ~12fps
const EMOTION_SEND_INTERVAL_MS = 100; // ~10fps
let lastPostureSent = 0;
let lastEmotionSent = 0;
const expressionsList = ['neutral','happy','sad','angry'];

let rafScheduled = false;
let latestPostureMsg = null;
let latestEmotionMsg = null;

// Detecção de ausência de rosto: quando o rosto sai do quadro, a stamina
// deve ir a 0 (e as métricas ficarem vazias), em vez de manter valores altos.
let _facePresent = false;
let _noFaceFrames = 0;
const NO_FACE_THRESHOLD = 3; // frames consecutivos sem rosto antes de zerar (~0.3s a 10fps)
let currentRawMetrics = null; 

// Variáveis de Lógica
let _lastTime = 0;
let _angerSadnessTimer = 0; 
let _joyTimer = 0;          
let _boostEndTime = 0;      
let _lastUiUpdate = 0;      

let _telemetryCurrentState = {
    posture: { shoulder: 'critico', head: 'critico', rotation: 'critico', back: 'critico' },
    emotion: { neutral: 0, happy: 0, sad: 0, angry: 0 }
};

let _currentStaminaValue = 100; 
let _notificationHistoryBuffer = []; 

function createEmptyMetricGroup() {
    return { perfeito: 0, bom: 0, ruim: 0, critico: 0 };
}

let detailedBuffer = {
    shoulder: createEmptyMetricGroup(),
    head:     createEmptyMetricGroup(),
    rotation: createEmptyMetricGroup(),
    back:     createEmptyMetricGroup(),
    neutral:  createEmptyMetricGroup(),
    happy:    createEmptyMetricGroup(),
    sad:      createEmptyMetricGroup(),
    angry:    createEmptyMetricGroup()
};

/* --- Funções de UI --- */
function getEmotionColorClass(emotion, value) {
  if (emotion === 'happy' || emotion === 'neutral') {
    return value > 60 ? 'green' : (value > 25 ? 'orange' : 'blue');
  }
  return value > 40 ? 'red' : (value > 15 ? 'orange' : 'green');
}

function updateDiagnosticUI(classification) {
  if (!classification) return;

  if(classification.shoulder) _telemetryCurrentState.posture.shoulder = mapPostureLabelToKey(classification.shoulder.label);
  if(classification.head)     _telemetryCurrentState.posture.head     = mapPostureLabelToKey(classification.head.label);
  if(classification.rotation) _telemetryCurrentState.posture.rotation = mapPostureLabelToKey(classification.rotation.label);
  if(classification.back)     _telemetryCurrentState.posture.back     = mapPostureLabelToKey(classification.back.label);

  const getCssClass = (label) => {
    if (!label) return '';
    return `status-${label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-')}`;
  };

  Object.keys(uiClassification).forEach(key => {
    const el = uiClassification[key];
    const data = classification[key];
    if (el && data) {
      el.textContent = data.label || '--';
      el.className = 'classificacao-categoria ' + (data.label ? getCssClass(data.label) : '');
    }
  });
}

function updateStaminaVisuals(val) {
  const v = Math.max(0, Math.min(100, Math.round(val)));
  
  let estadoCSS = 'excelente';   
  let textoStatus = 'Excelente'; 
  let avisoClass = 'aviso-excelente'; 

  if (v <= 24) {
      estadoCSS = 'critico'; textoStatus = 'Crítica'; avisoClass = 'aviso-critico';
  } else if (v <= 49) {
      estadoCSS = 'atencao'; textoStatus = 'Atenção'; avisoClass = 'aviso-atencao';
  } else if (v <= 74) {
      estadoCSS = 'boa'; textoStatus = 'Boa'; avisoClass = 'aviso-bom'; 
  }

  if (uiStaminaBar) {
      uiStaminaBar.style.width = `${v}%`;
      uiStaminaBar.className = 'barra-preenchida ' + estadoCSS;
  }
  const dashPct = document.querySelector(".porcentagem-stamina");
  if (dashPct) dashPct.textContent = `${v}%`;
  
  const dashStatus = document.querySelector(".stamina-status-text");
  if (dashStatus) {
      dashStatus.textContent = textoStatus;
      dashStatus.className = 'stamina-status-text ' + estadoCSS;
  }
  
  const dashContainer = document.querySelector('.div-stamina'); 
  if (dashContainer && dashContainer.id !== 'scan-stamina-container') {
       dashContainer.querySelectorAll('.aviso').forEach(el => el.classList.add('display-none'));
       const aviso = dashContainer.querySelector(`.${avisoClass}`);
       if (aviso) aviso.classList.remove('display-none');
  }

  const scanBar = document.getElementById('scan-stamina-preenchida');
  const scanPct = document.getElementById('scan-porcentagem');
  const scanStatus = document.getElementById('scan-status-text');
  const scanContainer = document.getElementById('scan-stamina-container');

  if (scanBar) { scanBar.style.width = `${v}%`; scanBar.className = 'barra-preenchida ' + estadoCSS; }
  if (scanPct) scanPct.textContent = `${v}%`;
  if (scanStatus) { scanStatus.textContent = textoStatus; scanStatus.className = 'stamina-status-text ' + estadoCSS; }
  if (scanContainer) {
      scanContainer.querySelectorAll('.aviso').forEach(el => el.classList.add('display-none'));
      const scanAviso = scanContainer.querySelector(`.${avisoClass}`);
      if (scanAviso) scanAviso.classList.remove('display-none');
  }
}

/* Loop de Lógica e UI */
/**
 * Estado "sem rosto detectado": stamina a 0% e métricas de emoção vazias.
 */
function setNoFaceState() {
  if (uiStaminaBar) { uiStaminaBar.style.width = '0%'; uiStaminaBar.className = 'barra-preenchida critico'; }
  const scanBar = document.getElementById('scan-stamina-preenchida');
  if (scanBar) { scanBar.style.width = '0%'; scanBar.className = 'barra-preenchida critico'; }
  document.querySelectorAll('.porcentagem-stamina').forEach(el => { el.textContent = '0%'; });
  document.querySelectorAll('.stamina-status-text').forEach(el => {
    el.textContent = 'Sem rosto'; el.className = 'stamina-status-text';
  });
  if (uiHumorTotal) { uiHumorTotal.textContent = '--'; uiHumorTotal.className = 'resultado-geral'; }
  Object.values(uiEmotions).forEach(el => { if (el) { el.textContent = '--'; el.className = 'classificacao-categoria'; } });
  _currentStaminaValue = 0;
  if (uiBoostBadge) uiBoostBadge.style.display = 'none';
}

function applyWorkerUpdates() {
  rafScheduled = false;
  const now = performance.now();

  // Sem rosto detectado -> zera tudo e nao recalcula com dados antigos
  if (!_facePresent) { setNoFaceState(); return; }

  // 1. Postura: atualiza as classificações individuais (ombro/cabeça/rotação/costas)
  if (latestPostureMsg && latestPostureMsg.metrics) {
    currentRawMetrics = latestPostureMsg.metrics;
    classifyPostureMetrics(latestPostureMsg.metrics).then(updateDiagnosticUI).catch(() => {});
  }

  // Sem dados de emoção/estado ainda -> não há o que atualizar (mantém "--")
  if (!latestEmotionMsg || !latestEmotionMsg.ema) return;

  const ema = latestEmotionMsg.ema;

  // 2. Usa DIRETAMENTE os valores que o worker já calcula em tempo real,
  //    a partir das métricas reais. NÃO recalcular aqui (era a causa do
  //    "trava em 85%/100%"). typeof === 'number' garante que score 0
  //    (postura crítica) seja respeitado em vez de virar default.
  const ergonomicsScore = (typeof latestEmotionMsg.postureRaw === 'number') ? latestEmotionMsg.postureRaw : 0;
  const emotionScore    = (typeof latestEmotionMsg.emotionRaw === 'number') ? latestEmotionMsg.emotionRaw : 0;
  const finalStamina    = (typeof latestEmotionMsg.final === 'number') ? latestEmotionMsg.final
                          : Math.round(ergonomicsScore * 0.7 + emotionScore * 0.3);
  const isBoostActive   = !!latestEmotionMsg.boostActive;

  _currentStaminaValue = finalStamina;
  updateStaminaVisuals(finalStamina);

  if (uiBoostBadge) {
    uiBoostBadge.style.display = isBoostActive ? 'block' : 'none';
    if (isBoostActive && latestEmotionMsg.boostExpiresAt) {
      const sec = Math.max(0, Math.ceil((latestEmotionMsg.boostExpiresAt - now) / 1000));
      uiBoostBadge.textContent = `BOOST ${sec}s`;
    }
  }

  // Mantém o estado de emoção sempre fresco (a cada leitura do worker), para
  // que a janela de predominância de 2s vote com dados atuais. A atualização
  // visual (texto/cor) continua no throttle de 500ms abaixo para não pesar.
  _telemetryCurrentState.emotion = ema;

  if (now - _lastUiUpdate > 500) {
    _lastUiUpdate = now;
    for (const k in uiEmotions) {
      const el = uiEmotions[k];
      if (el) {
        const pct = Math.round((ema[k] || 0) * 100);
        el.textContent = `${pct}%`;
        el.className = `classificacao-categoria ${getEmotionColorClass(k, pct)}`;
      }
    }

    if (uiHumorTotal) {
      const raw = Math.round(emotionScore);
      uiHumorTotal.textContent = `${raw}% - ${raw > 70 ? 'Ótimo' : (raw > 40 ? 'Médio' : 'Baixo')}`;
      uiHumorTotal.className = `resultado-geral ${raw > 70 ? 'green' : (raw > 40 ? 'orange' : 'red')}`;
    }
  }

  if (uiPostureTotal) {
    const rawP = Math.round(ergonomicsScore);
    uiPostureTotal.textContent = `${rawP}% - ${rawP > 80 ? 'Excelente' : (rawP > 50 ? 'Bom' : 'Ruim')}`;
    uiPostureTotal.className = `resultado-geral ${rawP > 80 ? 'green' : (rawP > 50 ? 'orange' : 'red')}`;
  }
}

/* --- Comunicação com Worker --- */
bgWorker.onmessage = (ev) => {
  const msg = ev.data;
  if (!msg) return;

  if (msg.type === 'postureMetrics') {
      latestPostureMsg = msg;
  }
  else if (msg.type === 'emotionState') {
      latestEmotionMsg = msg;
  }
  else if (msg.type === 'postureClassification' && msg.id != null) {
    const pending = _pendingClassify.get(msg.id);
    if (pending) { pending.resolve(msg.classification); _pendingClassify.delete(msg.id); }
    return;
  }
  else if (msg.type === 'calibrationSuccess') {
      console.log("✅ Calibração realizada!", msg.offsets);
      localStorage.setItem('userCalibration', JSON.stringify(msg.offsets));
      alert("Postura calibrada! Você receberá alertas a partir de agora.");
  }
  else if (msg.type === 'calibrationLoaded') {
      console.log("📂 Calibração carregada.");
  }

  if (!rafScheduled) {
    rafScheduled = true;
    requestAnimationFrame(applyWorkerUpdates);
  }
};

/* --- Helpers --- */
function landmarksToFloat32(landmarks){
  if (!landmarks || !landmarks.length) return null;
  const n = landmarks.length;
  const arr = new Float32Array(n * 3);
  for (let i = 0, b = 0; i < n; i++, b += 3) {
    const p = landmarks[i];
    arr[b] = p ? (p.x||0) : 0; arr[b+1] = p ? (p.y||0) : 0; arr[b+2] = p && ('z' in p) ? (p.z||0) : 0;
  }
  return arr;
}

function sendLandmarksToWorker(pose, face, ts){
  if (performance.now() - lastPostureSent < POSTURE_SEND_INTERVAL_MS) return;
  lastPostureSent = performance.now();
  const pArr = landmarksToFloat32(pose);
  const fArr = landmarksToFloat32(face);
  const msg = { type: 'landmarks', ts, poseCount: pArr ? pArr.length/3 : 0, faceCount: fArr ? fArr.length/3 : 0 };
  const transfers = [];
  if (pArr) { msg.poseBuffer = pArr.buffer; transfers.push(pArr.buffer); }
  if (fArr) { msg.faceBuffer = fArr.buffer; transfers.push(fArr.buffer); }
  bgWorker.postMessage(msg, transfers);
}

function sendExpressionsToWorker(expressionsObj, ts){
  if (performance.now() - lastEmotionSent < EMOTION_SEND_INTERVAL_MS) return;
  lastEmotionSent = performance.now();
  const arr = expressionsList.map(k => expressionsObj[k] || 0);
  bgWorker.postMessage({ type: 'expressions', ts, expressions: arr });
}

function drawHolisticResults(results){
  const vw = videoElement.videoWidth || 640;
  const vh = videoElement.videoHeight || 480;
  canvasElement.width = vw;
  canvasElement.height = vh;
  canvasCtx.clearRect(0, 0, vw, vh);
  canvasCtx.save();
  canvasCtx.scale(-1, 1);
  canvasCtx.translate(-vw, 0);

  if (results.poseLandmarks) {
    drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, { color: 'rgba(255,255,255,0.18)', lineWidth: 2 });
    drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#38bdf8', lineWidth: 1, radius: 2 });
  }
  if (results.faceLandmarks) {
      drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION, { color: '#C0C0C070', lineWidth: 1 });
      drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_RIGHT_EYEBROW, { color: '#EF4444', lineWidth: 3 }); 
      drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_LEFT_EYEBROW, { color: '#EF4444', lineWidth: 3 });
  }
  canvasCtx.restore();
}

function onHolisticResults(results){
  drawHolisticResults(results);
  sendLandmarksToWorker(results.poseLandmarks, results.faceLandmarks, performance.now());
}

async function emotionLoop(){
  if (videoElement.paused || videoElement.ended) { setTimeout(emotionLoop, 100); return; }
  try {
    const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 });
    
    const detection = await faceapi.detectSingleFace(videoElement, options).withFaceExpressions();

    if (detection) {
        _noFaceFrames = 0;
        _facePresent = true;
        sendExpressionsToWorker(detection.expressions, performance.now());
    } else {
        _noFaceFrames++;
        if (_noFaceFrames >= NO_FACE_THRESHOLD) {
            _facePresent = false;
            setNoFaceState();
        }
    }

  } catch (err) {
      console.error("Erro FaceAPI:", err);
  }
  setTimeout(emotionLoop, EMOTION_SEND_INTERVAL_MS);
}

/**
 * Coloca toda a UI de métricas no estado "vazio" (câmera inativa / sem dados):
 *  - Barras de stamina zeradas (largura 0%)
 *  - Porcentagem e status de stamina como "--"
 *  - Totais de postura e humor como "--"
 *  - Classificações individuais como "--"
 * Evita mostrar 85%/90% enganosos quando não há captação de imagem.
 */
function resetMetricsToInactive() {
  // Barras de stamina -> 0%
  if (uiStaminaBar) { uiStaminaBar.style.width = '0%'; uiStaminaBar.className = 'barra-preenchida'; }
  const scanBar = document.getElementById('scan-stamina-preenchida');
  if (scanBar) { scanBar.style.width = '0%'; scanBar.className = 'barra-preenchida'; }

  // Porcentagens de stamina -> "--"
  document.querySelectorAll('.porcentagem-stamina').forEach(el => { el.textContent = '--'; });

  // Status de stamina -> "--" (sem cor de estado)
  document.querySelectorAll('.stamina-status-text').forEach(el => {
    el.textContent = '--';
    el.className = 'stamina-status-text';
  });

  // Totais de postura/humor -> "--"
  if (uiPostureTotal) { uiPostureTotal.textContent = '--'; uiPostureTotal.className = 'resultado-geral'; }
  if (uiHumorTotal)   { uiHumorTotal.textContent   = '--'; uiHumorTotal.className   = 'resultado-geral'; }

  // Classificações individuais (ombro/cabeça/rotação/costas + emoções) -> "--"
  Object.values(uiClassification).forEach(el => { if (el) { el.textContent = '--'; el.className = 'classificacao-categoria'; } });
  Object.values(uiEmotions).forEach(el => { if (el) { el.textContent = '--'; el.className = 'classificacao-categoria'; } });
}

async function startApp(){
  resetMetricsToInactive();
  _facePresent = false;

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      cameraUnavailable("Seu navegador não suporta acesso à câmera.");
      return;
  }

  try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      if (!devices.some(d => d.kind === 'videoinput')) {
          cameraUnavailable("Nenhuma câmera encontrada neste dispositivo.");
          return;
      }
  } catch (_) { /* o getUserMedia abaixo é a rede de seguranca */ }

  try {
      const probe = await navigator.mediaDevices.getUserMedia({ video: true });
      probe.getTracks().forEach(t => t.stop());
  } catch (err) {
      cameraUnavailable(friendlyCameraError(err));
      return;
  }

  try {
      statusEl.textContent = "Carregando IA...";

      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights'),
        faceapi.nets.faceExpressionNet.loadFromUri('https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights')
      ]);

      const holistic = new Holistic({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}` });
      holistic.setOptions({ modelComplexity: 1, smoothLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
      holistic.onResults(onHolisticResults);

      const camera = new Camera(videoElement, { onFrame: async () => { await holistic.send({ image: videoElement }); }, width: 640, height: 480 });

      statusEl.textContent = "Iniciando Câmera...";
      await camera.start();

      statusEl.textContent = "Monitoramento Ativo";
      statusEl.classList.add('active');
      statusEl.classList.remove('error');
      if (statusEl) statusEl.title = "";

      const savedCalib = localStorage.getItem('userCalibration');
      if (savedCalib) {
          try {
              const offsets = JSON.parse(savedCalib);
              if(offsets && Object.keys(offsets).length > 0) {
                  bgWorker.postMessage({ type: 'setCalibration', offsets: offsets });
              }
          } catch (e) { console.error("Erro calibração:", e); }
      }

      emotionLoop();

  } catch (error) {
      console.error("Erro ao iniciar câmera:", error);
      cameraUnavailable(friendlyCameraError(error));
  }
}

function cameraUnavailable(msg) {
  if (statusEl) {
      statusEl.textContent = "Câmera Inativa";
      statusEl.classList.remove('active');
      statusEl.classList.add('error');
      statusEl.title = msg || "";
  }
  _facePresent = false;
  setNoFaceState();
  resetMetricsToInactive();
  console.warn("[camera]", msg);
}

function friendlyCameraError(err) {
  const name = (err && (err.name || err.code || err.message)) ? String(err.name || err.code || err.message) : "";
  if (/NotFound|DevicesNotFound|Overconstrained/i.test(name)) return "Nenhuma câmera encontrada neste dispositivo.";
  if (/NotAllowed|PermissionDenied|Security/i.test(name))      return "Permita o acesso à câmera para usar o monitoramento.";
  if (/NotReadable|TrackStart|InUse/i.test(name))              return "A câmera parece estar em uso por outro aplicativo.";
  return "Não foi possível acessar a câmera.";
}

const _pendingClassify = new Map();
let _classifyReqId = 1;
function classifyPostureMetrics(metrics) {
  return new Promise((resolve) => {
    const id = _classifyReqId++;
    _pendingClassify.set(id, { resolve });
    bgWorker.postMessage({ type: 'classifyMetrics', id, metrics });
    setTimeout(() => { if(_pendingClassify.has(id)) _pendingClassify.delete(id); }, 1000);
  });
}

const btnSendMetrics = document.getElementById('btn-send-metrics');
if (btnSendMetrics) {
  btnSendMetrics.addEventListener('click', () => {
    if (!latestPostureMsg || !latestPostureMsg.metrics) {
        alert("⚠️ Câmera inativa ou rosto não detectado!");
        return; 
    }
    requestNotificationPermission();
    bgWorker.postMessage({ type: 'calibrate' });
  });
}

window.addEventListener('DOMContentLoaded', startApp);

// ============================================================================
// MAPPEAMENTO
// ============================================================================
function mapPostureLabelToKey(label) {
    if (!label) return 'critico';
    const l = label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (l.includes('excelente') || l.includes('perfeito') || l.includes('ideal')) return 'perfeito';
    if (l.includes('boa') || l.includes('bom')) return 'bom';
    if (l.includes('atencao') || l.includes('ruim')) return 'ruim'; 
    if (l.includes('critica') || l.includes('critico')) return 'critico';
    return 'critico';
}

function getEmotionLabelForSync(emotionType, val0to1) {
    const pct = val0to1 * 100;

    // Emoções negativas: qualquer presença sustentada degrada o humor.
    if (['sad', 'angry'].includes(emotionType)) {
        if (pct === 0) return 'perfeito';
        if (pct <= 10) return 'bom';
        if (pct <= 50) return 'ruim';
        return 'critico';
    }

    // Neutro = estado saudável/calmo. NÃO é penalizado: estar sereno
    // durante o trabalho é positivo, então sempre conta como 'perfeito'.
    if (emotionType === 'neutral') {
        return 'perfeito';
    }

    // Felicidade (happy): positiva, escala com a intensidade.
    if (pct <= 25) return 'ruim';
    if (pct <= 50) return 'bom';
    return 'perfeito';
}

// Amostragem de POSTURA: a cada 10s grava o estado atual de cada parte.
// (Postura muda devagar; 10s é resolução suficiente e mantém o buffer enxuto.)
const SAMPLING_INTERVAL = 10000;
const SECONDS_PER_SAMPLE = 10;

// Amostragem de EMOÇÃO: janela curta de predominância real (2s).
// Em vez de um snapshot instantâneo (que capturava microexpressões soltas
// no momento exato do tick), acumulamos qual emoção domina em cada leitura
// dentro da janela e, ao fechá-la, gravamos a emoção que PREDOMINOU de fato
// na maior parte dos 2s. Isso dá fidelidade temporal sem ruído de pico.
const EMOTION_WINDOW_MS = 2000;
const EMOTION_WINDOW_SECONDS = 2; // quanto a janela vale no buffer (em "segundos")

// Preferência de desempate: do mais positivo para o menos. Em empate real
// de EMA, vence o estado mais saudável (não o "primeiro da lista").
const EMOTION_PRIORITY = ['happy', 'neutral', 'sad', 'angry'];

// Contagem de "vitórias" de cada emoção dentro da janela atual.
let _emotionWindowVotes = { neutral: 0, happy: 0, sad: 0, angry: 0 };
// Soma dos EMAs da emoção vencedora, p/ estimar a intensidade média dela.
let _emotionWindowMaxSum = { neutral: 0, happy: 0, sad: 0, angry: 0 };
let _emotionWindowTicks = 0;

/**
 * Escolhe a emoção dominante de UM instante (uma leitura de EMA).
 * Desempate pela ordem de positividade (EMOTION_PRIORITY), não pela ordem
 * de iteração — assim um empate neutral x happy vai para happy, e nunca
 * pende sistematicamente para neutral.
 */
function pickInstantDominant(emos) {
    let best = null;
    let bestVal = -Infinity;
    for (const k of EMOTION_PRIORITY) {
        const v = emos[k] || 0;
        if (v > bestVal) {
            bestVal = v;
            best = k;
        }
    }
    return { emo: best, val: bestVal };
}

// Coleta um "voto" a cada leitura curta (mesma cadência da UI de emoção).
function sampleEmotionTick() {
    if (!_facePresent) return; // sem rosto não vota
    const emos = _telemetryCurrentState.emotion;
    if (!emos) return;
    const { emo, val } = pickInstantDominant(emos);
    if (emo == null) return;
    _emotionWindowVotes[emo] += 1;
    _emotionWindowMaxSum[emo] += val;
    _emotionWindowTicks += 1;
}

// Fecha a janela de 2s: grava no buffer a emoção que predominou.
function flushEmotionWindow() {
    // Se não há rosto agora, ou nenhuma leitura válida foi coletada, descarta
    // a janela sem gravar (evita misturar votos de antes/depois da ausência).
    if (!_facePresent || _emotionWindowTicks === 0) {
        _emotionWindowVotes = { neutral: 0, happy: 0, sad: 0, angry: 0 };
        _emotionWindowMaxSum = { neutral: 0, happy: 0, sad: 0, angry: 0 };
        _emotionWindowTicks = 0;
        return;
    }

    // Vencedora da janela = mais votos; desempate por positividade.
    let winner = null;
    let winnerVotes = -1;
    for (const k of EMOTION_PRIORITY) {
        if (_emotionWindowVotes[k] > winnerVotes) {
            winnerVotes = _emotionWindowVotes[k];
            winner = k;
        }
    }

    // Intensidade média da vencedora dentro da janela (p/ classificar o bucket).
    const avgVal = _emotionWindowVotes[winner] > 0
        ? _emotionWindowMaxSum[winner] / _emotionWindowVotes[winner]
        : 0;

    const state = getEmotionLabelForSync(winner, avgVal);
    if (detailedBuffer[winner] && detailedBuffer[winner][state] !== undefined) {
        detailedBuffer[winner][state] += EMOTION_WINDOW_SECONDS;
    }

    // Reseta a janela.
    _emotionWindowVotes = { neutral: 0, happy: 0, sad: 0, angry: 0 };
    _emotionWindowMaxSum = { neutral: 0, happy: 0, sad: 0, angry: 0 };
    _emotionWindowTicks = 0;
}

// Coleta votos na mesma cadência do envio de expressões ao worker (~100ms),
// garantindo várias leituras por janela de 2s.
setInterval(sampleEmotionTick, EMOTION_SEND_INTERVAL_MS);

// Fecha a janela de emoção a cada 2s, gravando a predominante real.
setInterval(flushEmotionWindow, EMOTION_WINDOW_MS);

// Amostragem de POSTURA (independente da emoção): a cada 10s grava o estado
// atual de cada parte do corpo. As 4 partes são registradas a cada amostra.
setInterval(() => {
    Object.keys(detailedBuffer).forEach(key => {
        if (['shoulder', 'head', 'rotation', 'back'].includes(key)) {
            const state = _telemetryCurrentState.posture[key];
            if (detailedBuffer[key][state] !== undefined) {
                detailedBuffer[key][state] += SECONDS_PER_SAMPLE;
            }
        }
    });

    if (_currentStaminaValue > 0) _notificationHistoryBuffer.push(_currentStaminaValue);
}, SAMPLING_INTERVAL);

const METRICS_ENDPOINT = "https://api.stamflow.com.br/reports/sync";

setInterval(async () => {
  // Inclui a data no payload conforme esperado pelo backend (SyncPayload.date)
  const today = (function() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  })();

  const payload = { date: today, ...detailedBuffer };

  try {
    // Usa authFetch para refresh automático em caso de 401
    const fetchFunc = window.authFetch || fetch;
    const res = await fetchFunc(METRICS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      console.log("📤 Telemetria sincronizada!");
      Object.keys(detailedBuffer).forEach(k => detailedBuffer[k] = createEmptyMetricGroup());
    }
  } catch (err) { console.error("Falha API sync:", err); }
}, 30000);

// Notificações
function requestNotificationPermission() {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted" && Notification.permission !== "denied") Notification.requestPermission();
}

function sendStaminaNotification(average) {
    if (Notification.permission === "granted") {
        let body = `Sua média foi ${Math.round(average)}%. `;
        if (average >= 75) body += "Excelente! 🚀";
        else if (average >= 50) body += "Boa. 👍";
        else body += "Cuidado! ⚠️";
        new Notification("Resumo de Energia", { body, icon: "/StamFlowLogo-removebg-preview.png" });
    }
}

const NOTIFICATION_INTERVAL_MS = 30 * 60 * 1000; 
setInterval(() => {
    if (_notificationHistoryBuffer.length === 0) return;
    const sum = _notificationHistoryBuffer.reduce((a, b) => a + b, 0);
    sendStaminaNotification(sum / _notificationHistoryBuffer.length);
    _notificationHistoryBuffer = [];
}, NOTIFICATION_INTERVAL_MS);

/* ====================================================================
 * ALERTAS DE BEM-ESTAR (Tipo A) — integrados ao sino de notificações.
 *
 * Detecta condições ao vivo a partir do estado da câmera e dispara
 * alertas via window.StamflowNotifications.pushLocalAlert (que cuida do
 * pop-up nativo, da lista do sino e da persistência no backend).
 *
 * Regras:
 *   - 3h contínuas de uso (rosto presente)        -> recomenda pausa
 *   - 10 min contínuos em postura crítica         -> recomenda ajuste
 *   - 30 min contínuos em postura de atenção      -> recomenda ajuste
 *
 * "Contínuo" reinicia quando o rosto some por um período (pausa real) ou
 * quando a postura melhora. Cada alerta tem um cooldown para não repetir.
 * ==================================================================== */
(function () {
  "use strict";

  const CHECK_INTERVAL_MS = 30 * 1000;     // granularidade da verificação
  const SENTADO_LIMITE_MS = 3 * 60 * 60 * 1000;   // 3h
  const CRITICA_LIMITE_MS = 10 * 60 * 1000;       // 10 min
  const ATENCAO_LIMITE_MS = 30 * 60 * 1000;       // 30 min
  const COOLDOWN_MS = 15 * 60 * 1000;             // não repetir o mesmo alerta antes disso
  const AUSENCIA_RESET_MS = 60 * 1000;            // 1 min sem rosto reseta o "sentado contínuo"

  let _sentadoDesde = null;       // timestamp em que começou o uso contínuo
  let _ausenteDesde = null;       // timestamp em que o rosto sumiu
  let _criticaDesde = null;       // timestamp em que a postura ficou crítica
  let _atencaoDesde = null;       // timestamp em que a postura ficou em atenção

  let _ultimoAlertaPausa = -Infinity;
  let _ultimoAlertaCritica = -Infinity;
  let _ultimoAlertaAtencao = -Infinity;

  // Deriva o "nível geral" da postura a partir das 4 partes do corpo.
  // Conservador: a pior parte define o nível (bem-estar pede alerta cedo).
  function nivelPosturaGeral() {
    try {
      const p = _telemetryCurrentState && _telemetryCurrentState.posture;
      if (!p) return null;
      const vals = [p.shoulder, p.head, p.rotation, p.back];
      if (vals.includes("critico")) return "critico";
      if (vals.includes("ruim")) return "atencao";
      return "ok";
    } catch (e) {
      return null;
    }
  }

  function alertar(opts) {
    if (window.StamflowNotifications && typeof window.StamflowNotifications.pushLocalAlert === "function") {
      window.StamflowNotifications.pushLocalAlert(opts);
    }
  }

  setInterval(function () {
    const agora = Date.now();

    // --- Presença / uso contínuo ---
    if (_facePresent) {
      _ausenteDesde = null;
      if (_sentadoDesde === null) _sentadoDesde = agora;

      // 3h sentado -> pausa
      if (agora - _sentadoDesde >= SENTADO_LIMITE_MS &&
          agora - _ultimoAlertaPausa >= COOLDOWN_MS) {
        _ultimoAlertaPausa = agora;
        alertar({
          tipo: "pausa_recomendada",
          titulo: "Hora de uma pausa",
          mensagem: "Você está há cerca de 3 horas em frente ao computador. Que tal uma pausa mental para recarregar?",
          link_destino: "pausa-mental",
        });
      }
    } else {
      // Rosto ausente: se ficar ausente tempo suficiente, considera pausa real
      // e zera o contador de uso contínuo.
      if (_ausenteDesde === null) _ausenteDesde = agora;
      if (agora - _ausenteDesde >= AUSENCIA_RESET_MS) {
        _sentadoDesde = null;
      }
      // Sem rosto não há postura a avaliar.
      _criticaDesde = null;
      _atencaoDesde = null;
      return;
    }

    // --- Postura ---
    const nivel = nivelPosturaGeral();

    if (nivel === "critico") {
      _atencaoDesde = null;
      if (_criticaDesde === null) _criticaDesde = agora;
      if (agora - _criticaDesde >= CRITICA_LIMITE_MS &&
          agora - _ultimoAlertaCritica >= COOLDOWN_MS) {
        _ultimoAlertaCritica = agora;
        alertar({
          tipo: "postura_critica",
          titulo: "Ajuste sua postura",
          mensagem: "Você está há cerca de 10 minutos em postura crítica. Reposicione-se para evitar dores e fadiga.",
          link_destino: "checkup",
        });
      }
    } else if (nivel === "atencao") {
      _criticaDesde = null;
      if (_atencaoDesde === null) _atencaoDesde = agora;
      if (agora - _atencaoDesde >= ATENCAO_LIMITE_MS &&
          agora - _ultimoAlertaAtencao >= COOLDOWN_MS) {
        _ultimoAlertaAtencao = agora;
        alertar({
          tipo: "postura_atencao",
          titulo: "Atenção à postura",
          mensagem: "Você está há cerca de 30 minutos em postura de atenção. Um pequeno ajuste agora faz diferença.",
          link_destino: "checkup",
        });
      }
    } else {
      // Postura ok: zera os contadores de postura ruim.
      _criticaDesde = null;
      _atencaoDesde = null;
    }
  }, CHECK_INTERVAL_MS);
})();
