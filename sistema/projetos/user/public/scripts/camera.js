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

  if (now - _lastUiUpdate > 500) {
    _lastUiUpdate = now;
    _telemetryCurrentState.emotion = ema;
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
    if (['sad', 'angry'].includes(emotionType)) {
        if (pct === 0) return 'perfeito'; 
        if (pct <= 10) return 'bom';
        if (pct <= 50) return 'ruim';
        return 'critico';
    }
    if (pct <= 25) return 'critico';
    if (pct <= 50) return 'ruim';
    if (pct <= 75) return 'bom';
    return 'perfeito';
}

const SAMPLING_INTERVAL = 10000; 
const SECONDS_PER_SAMPLE = 10;   

// --- CORREÇÃO DO LOOP DE AMOSTRAGEM ---
// Agora escolhe a emoção DOMINANTE e incrementa apenas ela
setInterval(() => {
    // 1. Postura (mantido como está, pois são partes independentes)
    Object.keys(detailedBuffer).forEach(key => {
        if(['shoulder','head','rotation','back'].includes(key)){
            const state = _telemetryCurrentState.posture[key];
            if(detailedBuffer[key][state] !== undefined) detailedBuffer[key][state] += SECONDS_PER_SAMPLE;
        }
    });

    // 2. Emoção (CORRIGIDO: Escolhe apenas a vencedora)
    const emos = _telemetryCurrentState.emotion;
    // Encontra qual emoção tem o maior valor atual (ex: happy: 0.9, sad: 0.01)
    let dominantEmo = 'neutral';
    let maxVal = -1;

    ['neutral','happy','sad','angry'].forEach(k => {
        if (emos[k] > maxVal) {
            maxVal = emos[k];
            dominantEmo = k;
        }
    });

    // Incrementa APENAS a dominante no buffer
    const state = getEmotionLabelForSync(dominantEmo, maxVal);
    if(detailedBuffer[dominantEmo] && detailedBuffer[dominantEmo][state] !== undefined) {
        detailedBuffer[dominantEmo][state] += SECONDS_PER_SAMPLE;
    }

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