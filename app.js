const quickText = document.getElementById('quickText');
const speakBtn = document.getElementById('speakBtn');
const copyBtn = document.getElementById('copyBtn');
const contrastBtn = document.getElementById('contrastBtn');
const flashBtn = document.getElementById('flashBtn');
const quickPhrases = document.getElementById('quickPhrases');
const installBtn = document.getElementById('installBtn');

quickPhrases?.addEventListener('click', (e) => {
  if (e.target.classList.contains('chip')) {
    quickText.value = e.target.textContent;
  }
});

speakBtn?.addEventListener('click', () => {
  const text = quickText.value.trim();
  if (!text) return alert('Escribe primero un mensaje.');
  if (!('speechSynthesis' in window)) return alert('Tu navegador no soporta voz.');
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'es-ES';
  speechSynthesis.cancel();
  speechSynthesis.speak(utter);
});

copyBtn?.addEventListener('click', async () => {
  const text = quickText.value.trim();
  if (!text) return alert('No hay texto para copiar.');
  await navigator.clipboard.writeText(text);
  alert('Texto copiado.');
});

contrastBtn?.addEventListener('click', () => {
  document.body.classList.toggle('high-contrast');
});

flashBtn?.addEventListener('click', () => {
  document.body.classList.add('flash');
  setTimeout(() => document.body.classList.remove('flash'), 2200);
});

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.hidden = false;
});

installBtn?.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.hidden = true;
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
}
