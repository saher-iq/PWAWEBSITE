let deferredPrompt;

// Detect Android/Desktop install availability
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault(); // Prevent default mini-banner
  deferredPrompt = e;

  // Only show popup if not already installed
  if (!isAppInstalled()) {
    document.getElementById('a2hs-popup').style.display = 'block';
  }
});

// Function to install app
function installApp() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('App installed');
      }
      deferredPrompt = null;
    });
  }
  document.getElementById('a2hs-popup').style.display = 'none';
}

// Close popup manually
function closePopup(id) {
  document.getElementById(id).style.display = 'none';
}

// Detect if app is installed (Android/Desktop)
function isAppInstalled() {
  return (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true);
}

// iOS popup
function showiOSPopup() {
  const ua = window.navigator.userAgent;
  const isiOS = /iphone|ipad|ipod/i.test(ua);
  if (isiOS && !isAppInstalled()) {
    document.getElementById('ios-popup').style.display = 'block';
  }
}

// Run on load
window.addEventListener('load', () => {
  if (!isAppInstalled()) {
    showiOSPopup();
  } else {
    // Hide all popups if app already installed
    document.getElementById('a2hs-popup').style.display = 'none';
    document.getElementById('ios-popup').style.display = 'none';
  }
});
