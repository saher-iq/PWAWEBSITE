let deferredPrompt;

// Detect iOS
const isIos = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
};

// Detect if app is already installed
const isInStandaloneMode = () => ('standalone' in window.navigator) && window.navigator.standalone;

// Show popup for Android/Desktop
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (!isInStandaloneMode()) {
    document.getElementById('a2hs-popup').style.display = 'block';
  }
});

function installApp() {
  document.getElementById('a2hs-popup').style.display = 'none';
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(choiceResult => {
      deferredPrompt = null;
    });
  }
}

// Show popup for iOS
window.addEventListener('load', () => {
  if (isIos() && !isInStandaloneMode()) {
    document.getElementById('ios-popup').style.display = 'block';
  }
});

function closePopup(id) {
  document.getElementById(id).style.display = 'none';
}
