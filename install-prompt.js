let deferredPrompt;

const isInstalled =
  window.matchMedia("(display-mode: standalone)").matches ||
  navigator.standalone === true ||
  localStorage.getItem("appInstalled") === "yes";

const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isAndroid = /android/i.test(navigator.userAgent);

window.addEventListener("beforeinstallprompt", (e) => {
  if (isInstalled) return;

  e.preventDefault();
  deferredPrompt = e;
  document.getElementById("a2hs-popup").style.display = "block";
});

function installApp() {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();
  deferredPrompt.userChoice.then((choice) => {
    if (choice.outcome === "accepted") {
      localStorage.setItem("appInstalled", "yes");
    }
    document.getElementById("a2hs-popup").style.display = "none";
  });
}

window.addEventListener("load", () => {
  if (isInstalled) return;

  if (isIOS) {
    document.getElementById("ios-popup").style.display = "block";
  }
});

function closePopup(id) {
  document.getElementById(id).style.display = "none";
}
