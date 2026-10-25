// main.js
const taskTextEl = document.getElementById('task-text');
const taskTimeEl = document.getElementById('task-time');
const addTaskBtn = document.getElementById('add-task');
const enableNotifBtn = document.getElementById('enable-notifications');
const listEl = document.getElementById('task-list');

let tasks = [];
let timers = new Map();
const STORAGE_KEY = 'tasklist.tasks';

init();

function init() {
  try {
    tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    tasks = [];
  }

  // Re-schedule reminders for saved tasks after page reload
  tasks.forEach((task) => scheduleReminders(task));

  if (listEl) render();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js')
      .then(() => console.log('Service Worker registered'))
      .catch((err) => console.error('SW registration failed', err));
  }

  if (addTaskBtn) {
    addTaskBtn.addEventListener('click', onAddTask);
  }

  if (enableNotifBtn) {
    enableNotifBtn.addEventListener('click', requestNotificationPermission);
  }
}

function requestNotificationPermission() {
  if (!('Notification' in window)) {
    alert('Notifications are not supported in this browser.');
    return;
  }

  Notification.requestPermission().then((result) => {
    if (result === 'granted') {
      alert('Notifications enabled.');
    } else {
      alert('Notifications not enabled.');
    }
  });
}

function onAddTask() {
  if (!taskTextEl || !taskTimeEl) return;

  const text = taskTextEl.value.trim();
  const timeStr = taskTimeEl.value;

  if (!text || !timeStr) {
    alert('Please enter task and time.');
    return;
  }

  const id = crypto.randomUUID();
  const when = new Date(timeStr).getTime();

  if (Number.isNaN(when)) {
    alert('Invalid time.');
    return;
  }

  const task = { id, text, when };
  tasks.push(task);
  persist();
  scheduleReminders(task);
  render();

  taskTextEl.value = '';
  taskTimeEl.value = '';
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function render() {
  if (!listEl) return;

  listEl.innerHTML = '';
  const now = Date.now();

  tasks
    .sort((a, b) => a.when - b.when)
    .forEach((task) => {
      const li = document.createElement('li');

      const info = document.createElement('div');
      info.className = 'task-info';

      const title = document.createElement('div');
      title.textContent = task.text;

      const time = document.createElement('div');
      time.className = 'task-time';
      time.textContent = new Date(task.when).toLocaleString();

      if (task.when < now) {
        time.classList.add('overdue');
      }

      info.appendChild(title);
      info.appendChild(time);

      const del = document.createElement('button');
      del.setAttribute('aria-label', 'Delete task');
      del.textContent = '×';
      del.addEventListener('click', () => deleteTask(task.id));

      li.appendChild(info);
      li.appendChild(del);
      listEl.appendChild(li);
    });
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  cancelReminders(id);
  persist();
  render();
}

function cancelReminders(id) {
  const arr = timers.get(id) || [];
  arr.forEach((timeoutId) => clearTimeout(timeoutId));
  timers.delete(id);
}

function scheduleReminders(task) {
  cancelReminders(task.id);

  const reminders = [
    { when: task.when - 60 * 60 * 1000, label: 'Task in 1 hour' },
    { when: task.when - 5 * 60 * 1000, label: 'Task in 5 minutes' }
  ];

  const arr = [];
  reminders.forEach((reminder) => {
    const delay = reminder.when - Date.now();
    if (delay <= 0) return;

    const timeoutId = setTimeout(() => showReminder(task, reminder.label), delay);
    arr.push(timeoutId);
  });

  timers.set(task.id, arr);
}

function showReminder(task, label) {
  const title = `🔔 ${label}`;
  const body = task.text;

  if (Notification.permission === 'granted' && navigator.serviceWorker?.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'notify',
      title,
      body
    });
  } else {
    alert(`${label}: ${task.text}`);
  }
}
