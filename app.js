
const frases = [
  "Necesito ayuda, por favor.",
  "No puedo escuchar bien.",
  "¿Puedes escribirlo?",
  "Necesito un momento.",
  "Gracias por tu ayuda.",
  "Llama a un familiar, por favor."
];

const quickGrid = document.getElementById('quickGrid');
const texto = document.getElementById('texto');
const speakBtn = document.getElementById('speakBtn');
const stopBtn = document.getElementById('stopBtn');
const contrastBtn = document.getElementById('contrastBtn');
const chips = document.querySelectorAll('.chip');
const panel = document.getElementById('modePanel');
const installBtn = document.getElementById('installBtn');

const modeContent = {
  visual: {
    title: 'Modo Visión',
    text: 'Botones grandes, alto contraste, voz guiada y respuestas rápidas.'
  },
  auditivo: {
    title: 'Modo Audición',
    text: 'Textos muy visibles, mensajes preparados y vibración guiada cuando está disponible.'
  },
  mixto: {
    title: 'Modo Mixto',
    text: 'Combina voz, lectura visual y accesos simples para necesidades cruzadas.'
  }
};

function speak(text){
  if (!('speechSynthesis' in window)) {
    alert('Tu navegador no soporta lectura en voz alta.');
    return;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'es-ES';
  utter.rate = 0.95;
  window.speechSynthesis.speak(utter);
}

frases.forEach(frase => {
  const btn = document.createElement('button');
  btn.className = 'quick-btn';
  btn.textContent = frase;
  btn.addEventListener('click', () => {
    texto.value = frase;
    speak(frase);
    if (navigator.vibrate) navigator.vibrate([80, 40, 80]);
  });
  quickGrid.appendChild(btn);
});

speakBtn.addEventListener('click', () => speak(texto.value.trim() || 'Sin texto para leer.'));
stopBtn.addEventListener('click', () => window.speechSynthesis?.cancel());
contrastBtn.addEventListener('click', () => document.body.classList.toggle('high-contrast'));

chips.forEach(chip => {
  chip.addEventListener('click', () => {
    chips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    const data = modeContent[chip.dataset.mode];
    panel.innerHTML = `<h3>${data.title}</h3><p>${data.text}</p>`;
    if (navigator.vibrate) navigator.vibrate(40);
  });
});

let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.classList.remove('hidden');
});

installBtn?.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.classList.add('hidden');
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  });
}
