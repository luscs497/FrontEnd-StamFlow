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

// O1 — auto-calibracao pos-onboarding. Com o startApp adiado ate o clique em
// "Ativar StamFlow", a camera ainda esta subindo quando o script.js clica em
// #btn-send-metrics 100ms depois. Esta flag diz que a calibracao ja esta a
// caminho: o clique nao vira alerta de erro e a calibracao dispara sozinha
// quando o worker avisar que o buffer de amostras encheu (calibReady).
let _calibracaoPendente = false;

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

/*
 * Faixas da Stamina (fase 17).
 *
 * A régua antiga era 0-24 / 25-49 / 50-74 / 75-100, quatro fatias iguais de
 * 25 pontos. Ela pressupunha que a Stamina pudesse chegar a zero — o que
 * deixou de ser verdade quando o scoreRatio passou a ter piso 25 no "Crítico"
 * (fase 16, alinhado ao backend). A pior postura possível passou a valer
 * 0,9x25 + 0,1x58 = 28 pontos, ou seja, a faixa "Crítica" ficou inalcançável.
 *
 * Os cortes agora saem das ÂNCORAS naturais do sistema — as quatro
 * articulações todas no mesmo nível — com o humor neutro (58), que é o caso
 * dominante:
 *
 *   tudo Crítico   P= 25%  ->  28    tudo Bom       P= 75%  ->  73
 *   tudo Ruim      P= 50%  ->  51    tudo Perfeito  P=100%  ->  96
 *
 * e ficam nos PONTOS MÉDIOS entre elas (39,6 / 62,1 / 84,6). Isso é a partição
 * de Voronoi em 1D: maximiza a menor distância de uma âncora até uma
 * fronteira, que sobe de 1,2 para 10,8 pontos.
 *
 * A consequência que importa: nenhuma âncora troca de faixa por causa do
 * humor. Mesmo variando o humor de 8 (raiva sustentada) a 100 (alegria com
 * boost), "tudo Bom" fica em 68..78 e nunca cruza 85. A postura, que pesa 90%,
 * é quem decide a cor da barra — como deve ser.
 *
 * Mesma régua em sendStaminaNotification (abaixo) e em
 * get-repots.js -> classifyStamina. Se mudar aqui, mude nos três.
 */
function updateStaminaVisuals(val) {
  const v = Math.max(0, Math.min(100, Math.round(val)));

  let estadoCSS = 'excelente';
  let textoStatus = 'Excelente';
  let avisoClass = 'aviso-excelente';

  if (v <= 39) {
      estadoCSS = 'critico'; textoStatus = 'Crítica'; avisoClass = 'aviso-critico';
  } else if (v <= 62) {
      estadoCSS = 'atencao'; textoStatus = 'Atenção'; avisoClass = 'aviso-atencao';
  } else if (v <= 84) {
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
    // C5 — o worker ja calcula estes rotulos no mesmo passo em que compoe o
    // currentPostureScore (mesma funcao classifyMetricVal, mesmas entradas) e
    // agora os manda junto. Antes cada quadro pagava um segundo postMessage,
    // uma Promise, uma entrada de Map e um setTimeout de limpeza de 1s.
    if (latestPostureMsg.classification) updateDiagnosticUI(latestPostureMsg.classification);
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
                          // Mesmos pesos do worker (90/10) — este ramo e o
                          // fallback de quando o worker nao manda `final`.
                          : Math.round(ergonomicsScore * 0.9 + emotionScore * 0.1);
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
    // Escala da POSTURA pura (25..100), não da Stamina. Os cortes são os
    // pontos médios entre as mesmas âncoras (37,5 / 62,5 / 87,5), senão o
    // texto contradiz a barra: com P=81% a barra marca "Boa" (79) e o antigo
    // `rawP > 80` já dizia "Excelente".
    uiPostureTotal.textContent = `${rawP}% - ${rawP > 87 ? 'Excelente' : (rawP > 62 ? 'Bom' : 'Ruim')}`;
    uiPostureTotal.className = `resultado-geral ${rawP > 87 ? 'green' : (rawP > 62 ? 'orange' : 'red')}`;
  }
}

/* --- Comunicação com Worker --- */
bgWorker.onmessage = (ev) => {
  const msg = ev.data;
  if (!msg) return;

  if (msg.type === 'postureMetrics') {
      latestPostureMsg = msg;
      // O1 — calibracao agendada pelo onboarding: espera o worker sinalizar que
      // o buffer ja tem as CALIBRATION_SAMPLES amostras. Quem manda no numero
      // continua sendo o worker; aqui so se obedece ao calibReady, para a
      // calibracao seguir sendo a MEDIA da Fase 16 e nao um frame solto.
      if (_calibracaoPendente && msg.metrics && msg.calibReady) {
          _calibracaoPendente = false;
          bgWorker.postMessage({ type: 'calibrate' });
      }
  }
  else if (msg.type === 'emotionState') {
      latestEmotionMsg = msg;
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

/*
 * C3 — o #output vive dentro da aba "Checkup Scan", que nasce com
 * display:none e so aparece quando o usuario abre a aba. Um canvas escondido
 * NAO pula a rasterizacao: os comandos de desenho continuam executando contra
 * o backing store, so a composicao e descartada. Ou seja, os ~2,5 mil tracos
 * da malha facial eram pagos a cada quadro para pixels que ninguem via.
 * checkVisibility() responde olhando a cadeia de ancestrais; onde ele nao
 * existe (Safari < 17.4) o fallback e getClientRects().
 */
function canvasVisivel(){
  if (!canvasElement) return false;
  if (typeof canvasElement.checkVisibility === 'function') {
    return canvasElement.checkVisibility({ checkVisibilityCSS: true, contentVisibilityAuto: true });
  }
  return canvasElement.getClientRects().length > 0;
}

function drawHolisticResults(results){
  // Só o TRACO para. A inferencia, o envio ao worker, a calibracao, a stamina
  // e a telemetria seguem exatamente como antes — ver onHolisticResults.
  if (!canvasVisivel()) return;

  const vw = videoElement.videoWidth || 640;
  const vh = videoElement.videoHeight || 480;
  // C4 — atribuir width/height SEMPRE reseta o canvas e realoca o bitmap de
  // ~1,2 MB, mesmo quando o valor e identico (a 30fps eram ~37 MB/s de lixo
  // para o GC). So reatribui quando a dimensao muda de verdade; o clearRect
  // abaixo continua limpando o quadro nos demais casos.
  if (canvasElement.width !== vw || canvasElement.height !== vh) {
    canvasElement.width = vw;
    canvasElement.height = vh;
  }
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

  // Permissão de notificação nativa ao ligar a câmera: é aqui que começam a
  // correr os cronômetros de postura e de tempo sentado, então é o momento
  // em que os alertas passam a poder disparar. O notifications.js também
  // pede no load; ambos são no-op se o usuário já decidiu.
  requestNotificationPermission();

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
      iniciarTemporizadoresDeEmocao(); // Q6
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
  _calibracaoPendente = false; // camera indisponivel: nao ha calibracao a caminho
  pararTemporizadoresDeEmocao(); // Q6
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

// C5 — classifyPostureMetrics() foi removida: ela mandava as MESMAS metricas
// de volta ao worker (type: 'classifyMetrics') so para receber os rotulos que
// o worker ja tinha calculado e descartado, ao custo de uma Promise, uma
// entrada de Map e um setTimeout por quadro. Os rotulos agora chegam dentro da
// propria mensagem 'postureMetrics'. O handler no worker continua la, inerte,
// para nao quebrar nada que ainda o chame.

const btnSendMetrics = document.getElementById('btn-send-metrics');
if (btnSendMetrics) {
  btnSendMetrics.addEventListener('click', () => {
    if (!latestPostureMsg || !latestPostureMsg.metrics) {
        // Auto-calibracao pos-onboarding: a camera ainda esta subindo, a
        // calibracao ja esta agendada e dispara sozinha assim que o buffer
        // encher. Nao ha erro nenhum a relatar ao usuario aqui.
        if (_calibracaoPendente) return;
        alert("⚠️ Câmera inativa ou rosto não detectado!");
        return;
    }
    requestNotificationPermission();
    bgWorker.postMessage({ type: 'calibrate' });
  });
}

// Inicialização da câmera/IA. Como agora os scripts são carregados em duas
// fases (o camera.js entra na fase 2, DEPOIS do DOMContentLoaded já ter sido
// disparado), escutamos também o evento "stamflow:heavy-ready" emitido pelo
// bootstrap ao terminar de carregar as libs pesadas. Um guard evita rodar
// startApp duas vezes caso ambos os eventos ocorram.
let __startAppDone = false;
function __startAppOnce() {
  if (__startAppDone) return;
  __startAppDone = true;
  startApp();
}

/*
 * O1 — a pilha de visao computacional NAO pode subir durante o onboarding.
 *
 * Antes, startApp() rodava assim que o camera.js era avaliado (o readyState ja
 * era "complete" na fase 2, entao o setTimeout(...,0) disparava na hora, antes
 * mesmo do stamflow:heavy-ready). Resultado: enquanto o usuario deslizava os
 * quatro slides, o aparelho baixava os pesos do face-api, baixava E COMPILAVA
 * o WASM + .tflite do Holistic (compilacao de WASM bloqueia a main thread),
 * abria o prompt de camera por cima do slide 1 e, logo em seguida, rodava duas
 * CNNs mais ~2,5 mil tracos de canvas por quadro — tudo competindo com a
 * animacao do Swiper na mesma thread.
 *
 * Agora: quem ja passou pelo onboarding (ou nao tem onboarding na tela) inicia
 * exatamente como antes. Quem esta vendo o onboarding so liga a camera ao
 * tocar em "Ativar StamFlow" — o mesmo clique que o script.js ja usa para
 * fechar o onboarding e pedir a calibracao.
 */
function __onboardingAberto() {
  if (localStorage.getItem('onboardingCompleted') === 'true') return false;
  const onb = document.getElementById('on-boarding');
  if (!onb) return false;
  return !onb.classList.contains('display-none');
}

let __startAppAgendado = false;
function __agendarStartApp() {
  if (__startAppAgendado || __startAppDone) return;
  __startAppAgendado = true;

  if (!__onboardingAberto()) {
    __startAppOnce();
    return;
  }

  // Onboarding no ar: espera o "Ativar StamFlow". O script.js escuta o mesmo
  // clique para esconder o onboarding, gravar onboardingCompleted e disparar
  // #btn-send-metrics 100ms depois — por isso marcamos aqui que a calibracao
  // esta a caminho, senao aquele clique cairia no alerta de "Camera inativa".
  document.addEventListener('click', (e) => {
    if (!e.target || !e.target.closest || !e.target.closest('#ativar-sistema')) return;
    _calibracaoPendente = true;
    __startAppOnce();
  });
}

window.addEventListener('DOMContentLoaded', __agendarStartApp);
document.addEventListener('stamflow:heavy-ready', __agendarStartApp);
// Se o script carregar quando o DOM ja esta pronto (fase 2 tardia), agenda ja.
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  // pequeno defer para garantir que os globals (Holistic, faceapi) existam
  setTimeout(__agendarStartApp, 0);
}

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

    // Entusiasmo (happy): positiva, escala com a intensidade.
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

// Q6 — estes dois temporizadores nasciam junto com o script e rodavam a 10 Hz
// e 0,5 Hz para sempre, mesmo com a camera desligada (e, depois do O1, durante
// todo o onboarding). Agora sobem com a camera e caem com ela. A cadencia e o
// conteudo de cada tick sao os mesmos de antes.
let _temporizadoresEmocao = null;

function iniciarTemporizadoresDeEmocao() {
  if (_temporizadoresEmocao) return;
  _temporizadoresEmocao = {
    // Coleta votos na mesma cadência do envio de expressões ao worker (~100ms),
    // garantindo várias leituras por janela de 2s.
    amostra: setInterval(sampleEmotionTick, EMOTION_SEND_INTERVAL_MS),
    // Fecha a janela de emoção a cada 2s, gravando a predominante real.
    janela: setInterval(flushEmotionWindow, EMOTION_WINDOW_MS)
  };
}

function pararTemporizadoresDeEmocao() {
  if (!_temporizadoresEmocao) return;
  clearInterval(_temporizadoresEmocao.amostra);
  clearInterval(_temporizadoresEmocao.janela);
  _temporizadoresEmocao = null;
}

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
        // Mesma régua de updateStaminaVisuals: a notificação não pode chamar
        // de "Boa" uma média que a barra estava pintando de laranja.
        let body = `Sua média foi ${Math.round(average)}%. `;
        if (average >= 85) body += "Excelente! 🚀";
        else if (average >= 63) body += "Boa. 👍";
        else if (average >= 40) body += "Atenção. ⚠️";
        else body += "Cuidado! 🚨";
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
 * ALERTAS DE BEM-ESTAR E POSTURA — integrados ao sino de notificações.
 *
 * Gerencia dois cronômetros a partir do estado ao vivo da câmera e
 * dispara 4 alertas, cada um UMA ÚNICA VEZ por dia:
 *
 *   [1] 30 min de postura ruim acumulada  -> toast que some em 5s
 *   [2] 60 min de postura ruim acumulada  -> modal + [Ir para exercício]
 *   [3]  3 h de sessão contínua sentado   -> modal + [Ir para exercícios]
 *   [4]  4 h de sessão contínua sentado   -> modal + [Pausa mental]
 *
 * Os dois cronômetros medem coisas diferentes de propósito:
 *   - sentado: tempo CONTÍNUO com rosto presente. Sumir por mais de
 *     AUSENCIA_RESET_MS conta como pausa real e zera a sessão.
 *   - postura ruim: tempo ACUMULADO em "atenção" OU "crítica" (os dois
 *     níveis somam no mesmo contador). Endireitar a coluna por um
 *     minuto não apaga o desgaste do que já passou — só uma pausa de
 *     verdade (a mesma que zera a sessão) reinicia a conta.
 *
 * Sumir da câmera nem sempre é pausa: virar para o colega, pegar o copo
 * ou um frame que o detector perdeu tiram o rosto por poucos segundos.
 * Por isso a ausência tem duas faixas — até AUSENCIA_RESET_MS os dois
 * cronômetros só PAUSAM (o tempo fora não entra, mas nada é perdido);
 * passando disso é pausa real e zera. E toda volta passa por um warm-up
 * de WARMUP_MS antes de voltar a contar, para quem está se ajeitando na
 * cadeira não somar tempo nem levar postura crítica pelo movimento.
 *
 * O disparo passa por window.StamflowNotifications.pushLocalAlert, que
 * já cuida do item no sino, do pop-up nativo do navegador e do
 * POST /notifications (com credentials e X-CSRF-Token, via o fetch
 * patchado do auth.js). Ou seja: todo alerta desta tela vira histórico.
 *
 * Substitui o bloco anterior (10 min contínuos em crítica / 30 min em
 * atenção / 3 h sentado, com cooldown e repetição). As regras novas são
 * outras e conviver com as antigas geraria alerta duplicado.
 * ==================================================================== */
(function () {
  "use strict";

  // 1s, e não os 15s de antes: a tolerância de ausência (10s) e o
  // warm-up (2s) são mais curtos que o tick antigo, então com ele um
  // sumiço de 9s podia cair inteiro entre dois ticks (nunca observado)
  // e um warm-up de 2s duraria 15s na prática.
  const TICK_MS = 1000;                   // granularidade da verificação
  // Aba em segundo plano estrangula timers: sem teto, um tick atrasado
  // injetaria minutos de uma só vez em quem nem estava na tela. O teto
  // é absoluto (e não TICK_MS * 3) para continuar valendo os mesmos 45s
  // de antes — atrelado ao tick novo, passaria a descontar tempo real.
  const DELTA_MAX_MS = 45 * 1000;
  const AUSENCIA_RESET_MS = 10 * 1000;    // 10s sem rosto = pausa real
  const WARMUP_MS = 2 * 1000;             // na volta, 2s para se acomodar
  const TOAST_MS = 5000;                  // [1] some sozinho, sem clique

  const LIMITE_POSTURA_TOAST = 30 * 60 * 1000;
  const LIMITE_POSTURA_MODAL = 60 * 60 * 1000;
  const LIMITE_SENTADO_EXERCICIO = 3 * 60 * 60 * 1000;
  const LIMITE_SENTADO_MENTAL = 4 * 60 * 60 * 1000;

  const STORAGE_KEY = "stamflow:alertas-bem-estar";

  // --- Estado dos cronômetros (só em memória: valem para a sessão) ---
  let _sentadoMs = 0;
  let _posturaRuimMs = 0;
  let _ausenteDesde = null;
  let _retornoDesde = null;
  let _ultimoTick = null;

  // ------------------------------------------------------------------
  // Flags de "uma vez por dia"
  //
  // Ficam no localStorage porque um F5 não pode devolver os 4 alertas do
  // dia: sem isso, recarregar a página zeraria as flags e o usuário
  // levaria o mesmo modal de novo assim que os contadores subissem.
  // ------------------------------------------------------------------
  function hojeISO() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  let _dia = hojeISO();
  let _disparados = lerDisparados();

  function lerDisparados() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const dados = JSON.parse(raw);
      if (!dados || dados.dia !== hojeISO()) return {};
      return dados.disparados || {};
    } catch (e) {
      return {}; // localStorage bloqueado: as flags valem só para a sessão
    }
  }

  function jaDisparou(id) {
    return _disparados[id] === true;
  }

  function marcarDisparado(id) {
    _disparados[id] = true;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ dia: _dia, disparados: _disparados })
      );
    } catch (e) { /* sessão anônima/cota cheia: segue só em memória */ }
  }

  // Vira o dia com a aba aberta (turno da madrugada): libera os 4 de novo.
  function conferirViradaDeDia() {
    const agora = hojeISO();
    if (agora !== _dia) {
      _dia = agora;
      _disparados = {};
    }
  }

  // ------------------------------------------------------------------
  // UI — toast e modal
  // ------------------------------------------------------------------
  function el(id) {
    return document.getElementById(id);
  }

  let _toastTimer = null;
  let _toastSaida = null;

  function mostrarToast(mensagem) {
    const toast = el("alerta-bem-estar-toast");
    const texto = el("alerta-bem-estar-toast-texto");
    if (!toast || !texto) return;

    clearTimeout(_toastTimer);
    clearTimeout(_toastSaida);
    texto.textContent = mensagem;

    // display-none sai primeiro; sem o reflow entre tirar o display e pôr
    // a classe .visivel, o navegador agrupa as duas mudanças e a transição
    // de entrada não roda.
    toast.classList.remove("display-none");
    void toast.offsetWidth;
    toast.classList.add("visivel");

    _toastTimer = setTimeout(esconderToast, TOAST_MS);
  }

  function esconderToast() {
    const toast = el("alerta-bem-estar-toast");
    if (!toast) return;
    toast.classList.remove("visivel");
    _toastSaida = setTimeout(() => toast.classList.add("display-none"), 320);
  }

  // Fila: 60 min de postura ruim e 3 h sentado podem cair no mesmo tick.
  // Empilhar dois modais deixaria um preso atrás do outro.
  let _filaModais = [];
  let _modalAberto = false;

  function abrirModal(cfg) {
    const overlay = el("alerta-bem-estar-overlay");
    const titulo = el("alerta-bem-estar-titulo");
    const mensagem = el("alerta-bem-estar-mensagem");
    const acao = el("alerta-bem-estar-acao");
    const ignorar = el("alerta-bem-estar-ignorar");
    if (!overlay || !titulo || !mensagem || !acao || !ignorar) return;

    if (_modalAberto) {
      _filaModais.push(cfg);
      return;
    }

    titulo.textContent = cfg.titulo;
    mensagem.textContent = cfg.mensagem;
    acao.textContent = cfg.rotuloAcao;

    // onclick (e não addEventListener) porque o mesmo botão serve os 3
    // modais: a atribuição substitui o handler anterior em vez de somar.
    acao.onclick = function () {
      fecharModal();
      irParaAba(cfg.aba);
    };
    ignorar.onclick = fecharModal;

    overlay.classList.remove("display-none");
    _modalAberto = true;
    acao.focus();
  }

  function fecharModal() {
    const overlay = el("alerta-bem-estar-overlay");
    if (overlay) overlay.classList.add("display-none");
    _modalAberto = false;

    if (_filaModais.length) {
      const proximo = _filaModais.shift();
      setTimeout(() => abrirModal(proximo), 400);
    }
  }

  // Esc fecha (equivale a Ignorar). Clique no fundo NÃO fecha: o alerta
  // pede uma decisão, não some por um clique perdido na tela.
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && _modalAberto) fecharModal();
  });

  // Navega clicando no item de menu, mantendo o app como única fonte de
  // verdade da navegação (mesma abordagem do notifications.js).
  function irParaAba(titulo) {
    const item = Array.from(document.querySelectorAll(".link-nav")).find(
      (n) => (n.getAttribute("title") || "").trim() === titulo
    );
    if (item) item.click();
  }

  // ------------------------------------------------------------------
  // Disparo
  // ------------------------------------------------------------------
  // Manda para o sino + pop-up nativo + POST /notifications.
  function registrarNoHistorico(opts) {
    if (
      window.StamflowNotifications &&
      typeof window.StamflowNotifications.pushLocalAlert === "function"
    ) {
      window.StamflowNotifications.pushLocalAlert(opts);
    }
  }

  function dispararToast(cfg) {
    marcarDisparado(cfg.id);
    mostrarToast(cfg.mensagem);
    registrarNoHistorico({
      tipo: cfg.tipo,
      titulo: cfg.titulo,
      mensagem: cfg.mensagem,
      link_destino: cfg.destino,
    });
  }

  function dispararModal(cfg) {
    marcarDisparado(cfg.id);
    abrirModal(cfg);
    registrarNoHistorico({
      tipo: cfg.tipo,
      titulo: cfg.titulo,
      mensagem: cfg.mensagem,
      link_destino: cfg.destino,
    });
  }

  // Deriva o nível geral da postura a partir das 4 partes do corpo.
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

  function zerarSessao() {
    _sentadoMs = 0;
    _posturaRuimMs = 0;
  }

  // ------------------------------------------------------------------
  // Loop
  // ------------------------------------------------------------------
  setInterval(function () {
    const agora = Date.now();
    const delta = _ultimoTick === null ? 0 : Math.min(agora - _ultimoTick, DELTA_MAX_MS);
    _ultimoTick = agora;

    conferirViradaDeDia();

    if (!_facePresent) {
      if (_ausenteDesde === null) _ausenteDesde = agora;
      // Curta: só pausa — sair sem somar delta já segura os cronômetros
      // onde estavam. Longa: pausa real, reinicia sessão e postura.
      if (agora - _ausenteDesde >= AUSENCIA_RESET_MS) zerarSessao();
      // Qualquer sumiço, por menor que seja, reabre o warm-up na volta.
      _retornoDesde = null;
      return;
    }

    // Rosto de volta: marca o instante do retorno para o warm-up correr.
    if (_ausenteDesde !== null) {
      _retornoDesde = agora;
      _ausenteDesde = null;
    }

    // Warm-up: enquanto a pessoa se acomoda, o tempo não corre e a
    // postura não é lida — é justamente aí que ela aparece "crítica"
    // por estar se ajeitando, e viraria falso positivo.
    if (_retornoDesde !== null) {
      if (agora - _retornoDesde < WARMUP_MS) return;
      _retornoDesde = null;
    }

    _sentadoMs += delta;

    const nivel = nivelPosturaGeral();
    if (nivel === "critico" || nivel === "atencao") _posturaRuimMs += delta;

    // [1] 30 min de postura ruim -> toast de 5s
    if (_posturaRuimMs >= LIMITE_POSTURA_TOAST && !jaDisparou("postura30")) {
      dispararToast({
        id: "postura30",
        tipo: "postura_critica",
        titulo: "Alerta de Postura",
        mensagem:
          "Alerta de postura: você permaneceu 30min em postura de nível crítico. Procure alinhar a postura ou fazer uma pausa",
        destino: "checkup",
      });
    }

    // [2] 60 min de postura ruim -> modal com [Ir para exercício]
    if (_posturaRuimMs >= LIMITE_POSTURA_MODAL && !jaDisparou("postura60")) {
      dispararModal({
        id: "postura60",
        tipo: "postura_critica",
        titulo: "Atenção à sua postura",
        mensagem:
          "Atenção: você permaneceu 60min em postura de nível crítico. Faça uma pausa preventiva, fortalecendo seu corpo.",
        rotuloAcao: "Ir para exercício",
        aba: "Exercises",
        destino: "exercicios",
      });
    }

    // [3] 3 h sentado -> modal com [Ir para exercícios]
    if (_sentadoMs >= LIMITE_SENTADO_EXERCICIO && !jaDisparou("sentado3h")) {
      dispararModal({
        id: "sentado3h",
        tipo: "pausa_recomendada",
        titulo: "Ergonomia ativa",
        mensagem:
          "Ergonomia ativa: 3 horas sentado reduz a eficiência vascular. Eleve seu fluxo sanguíneo e disposição",
        rotuloAcao: "Ir para exercícios",
        aba: "Exercises",
        destino: "exercicios",
      });
    }

    // [4] 4 h sentado -> modal com [Pausa mental]
    if (_sentadoMs >= LIMITE_SENTADO_MENTAL && !jaDisparou("sentado4h")) {
      dispararModal({
        id: "sentado4h",
        tipo: "pausa_recomendada",
        titulo: "Limpar o cache mental",
        mensagem:
          "Limpar o cache mental: muito tempo na mesma posição eleva o cortisol silenciosamente. Ative o modo de calma.",
        rotuloAcao: "Pausa mental",
        aba: "Mental Pause",
        destino: "pausa-mental",
      });
    }
  }, TICK_MS);

  // Exposto para depuração e para os testes manuais: permite forçar os
  // contadores sem esperar 4 horas na frente da câmera.
  window.StamflowBemEstar = {
    estado: function () {
      return {
        sentadoMs: _sentadoMs,
        posturaRuimMs: _posturaRuimMs,
        disparados: Object.assign({}, _disparados),
        facePresent: typeof _facePresent === "boolean" ? _facePresent : null,
        ausenteHaMs: _ausenteDesde === null ? 0 : Date.now() - _ausenteDesde,
        emWarmup: _retornoDesde !== null,
        nivelPostura: nivelPosturaGeral(),
      };
    },
    simular: function (sentadoMs, posturaRuimMs) {
      if (typeof sentadoMs === "number") _sentadoMs = sentadoMs;
      if (typeof posturaRuimMs === "number") _posturaRuimMs = posturaRuimMs;
    },
    limparFlags: function () {
      _disparados = {};
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    },
  };
})();
