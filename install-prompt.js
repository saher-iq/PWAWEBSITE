let deferredPrompt;

// Android/Desktop: intercept beforeinstallprompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (!isAppInstalled()) {
    document.getElementById('a2hs-popup').style.display = 'block';
  }
});

function installApp() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => deferredPrompt = null);
  }
  document.getElementById('a2hs-popup').style.display = 'none';
}

function closePopup(id) {
  document.getElementById(id).style.display = 'none';
}

function isAppInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

// iOS popup
function showiOSPopup() {
  const ua = window.navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua) && !isAppInstalled()) {
    document.getElementById('ios-popup').style.display = 'block';
  }
}

// On page load
window.addEventListener('load', () => {
  if (isAppInstalled()) {
    document.getElementById('a2hs-popup').style.display = 'none';
    document.getElementById('ios-popup').style.display = 'none';
  } else {
    showiOSPopup();
  }

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/PWAWEBSITE/service-worker.js')
      .then(() => console.log('Service Worker registered'))
      .catch(err => console.error('SW registration failed:', err));
  }
});
