// server.js
const express = require('express');
const bodyParser = require('body-parser');
const webpush = require('web-push');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.error('Missing VAPID keys. Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY env vars.');
  process.exit(1);
}

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// Persist these in a DB in production
const SUBSCRIPTIONS = new Map(); // endpoint -> subscription
const SCHEDULED = new Map(); // taskId -> [timeouts]

app.get('/vapidPublicKey', (req, res) => {
  res.send(VAPID_PUBLIC_KEY);
});

app.post('/save-subscription', (req, res) => {
  const subscription = req.body;
  if (!subscription?.endpoint) return res.status(400).json({ error: 'invalid subscription' });
  SUBSCRIPTIONS.set(subscription.endpoint, subscription);
  res.json({ ok: true });
});

app.post('/schedule-task-reminders', (req, res) => {
  const { id, text, timeISO } = req.body;
  if (!id || !text || !timeISO) return res.status(400).json({ error: 'missing fields' });

  const taskStart = new Date(timeISO).getTime();
  if (isNaN(taskStart)) return res.status(400).json({ error: 'invalid time' });

  const reminders = [
    { when: taskStart - 60 * 60 * 1000, label: 'Task in 1 hour' },
    { when: taskStart - 5 * 60 * 1000, label: 'Task in 5 minutes' },
  ];

  // cancel previous
  const prev = SCHEDULED.get(id) || [];
  prev.forEach(t => clearTimeout(t));
  SCHEDULED.set(id, []);

  reminders.forEach(r => {
    const delay = r.when - Date.now();
    if (delay <= 0) return;
    const timeout = setTimeout(() => {
      sendNotificationToAll({
        title: `🔔 ${r.label}`,
        body: `${text}`,
        url: '/'
      }).catch(err => console.error('push send error', err));
    }, delay);

    const arr = SCHEDULED.get(id);
    arr.push(timeout);
    SCHEDULED.set(id, arr);
  });

  res.json({ ok: true, scheduledCount: (SCHEDULED.get(id) || []).length });
});

app.post('/delete-task', (req, res) => {
  const { id } = req.body;
  const arr = SCHEDULED.get(id) || [];
  arr.forEach(t => clearTimeout(t));
  SCHEDULED.delete(id);
  res.json({ ok: true });
});

async function sendNotificationToAll(payload) {
  const sendPromises = Array.from(SUBSCRIPTIONS.values()).map(sub =>
    webpush.sendNotification(sub, JSON.stringify(payload)).catch(err => {
      console.error('Error sending to subscription', err);
      // Cleanup gone subscriptions (410 Gone)
      if (err?.statusCode === 410 || err?.statusCode === 404) {
        SUBSCRIPTIONS.delete(sub.endpoint);
      }
    })
  );
  await Promise.all(sendPromises);
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Push server running on port ${PORT}`);
  console.log('VAPID public key:', VAPID_PUBLIC_KEY);
});
