// stopwatch.js
(function () {
  const display = document.getElementById('stopwatch-display');
  const startBtn = document.getElementById('start-stopwatch');
  const lapBtn = document.getElementById('lap-stopwatch');
  const resetBtn = document.getElementById('reset-stopwatch');
  const lapListEl = document.getElementById('lap-list');

  if (!display || !startBtn || !lapBtn || !resetBtn || !lapListEl) return;

  let startTime = 0;
  let elapsed = 0;
  let intervalId = null;
  let lapCount = 0;

  function formatTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const hundredths = Math.floor((ms % 1000) / 10);
    return (
      String(minutes).padStart(2, '0') + ':' +
      String(seconds).padStart(2, '0') + '.' +
      String(hundredths).padStart(2, '0')
    );
  }

  function updateDisplay() {
    display.textContent = formatTime(elapsed);
  }

  function start() {
    if (intervalId) return;
    startTime = Date.now() - elapsed;
    intervalId = setInterval(function () {
      elapsed = Date.now() - startTime;
      updateDisplay();
    }, 10);
    startBtn.textContent = 'Stop';
    lapBtn.disabled = false;
  }

  function stop() {
    clearInterval(intervalId);
    intervalId = null;
    startBtn.textContent = 'Start';
    lapBtn.disabled = true;
  }

  function reset() {
    stop();
    elapsed = 0;
    lapCount = 0;
    lapListEl.innerHTML = '';
    updateDisplay();
  }

  function addLap() {
    if (!intervalId) return;
    lapCount += 1;

    const li = document.createElement('li');
    const label = document.createElement('span');
    label.textContent = 'Lap ' + lapCount;
    const value = document.createElement('span');
    value.textContent = formatTime(elapsed);

    li.appendChild(label);
    li.appendChild(value);
    lapListEl.prepend(li);
  }

  startBtn.addEventListener('click', function () {
    if (intervalId) stop();
    else start();
  });
  lapBtn.addEventListener('click', addLap);
  resetBtn.addEventListener('click', reset);

  updateDisplay();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch(function (err) {
      console.error('SW registration failed', err);
    });
  }
})();
