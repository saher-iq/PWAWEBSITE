// install-prompt.js
let deferredPrompt;
const a2hsPopup = document.getElementById('a2hs-popup');
const a2hsAccept = document.getElementById('a2hs-accept');
const a2hsDismiss = document.getElementById('a2hs-dismiss');

const iosPopup = document.getElementById('ios-popup');
const iosDismiss = document.getElementById('ios-dismiss');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showA2HS();
});

function showA2HS() {
  if (!deferredPrompt) return;
  a2hsPopup.classList.add('show');
}

a2hsAccept?.addEventListener('click', async () => {
  a2hsPopup.classList.remove('show');
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  deferredPrompt = null;
});

a2hsDismiss?.addEventListener('click', () => {
  a2hsPopup.classList.remove('show');
});

// Simple iOS detection (Safari iOS lacks beforeinstallprompt)
const isIOS = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent);
const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

window.addEventListener('load', () => {
  if (isIOS() && !isStandalone()) {
    iosPopup.classList.add('show');
  }
});

iosDismiss?.addEventListener('click', () => {
  iosPopup.classList.remove('show');
});
