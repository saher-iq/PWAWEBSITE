// Example Node.js server to accept subscriptions and schedule push notifications.
// For production: replace in-memory storage with a DB, secure endpoints, authentication, etc.

const express = require('express');
const bodyParser = require('body-parser');
const webpush = require('web-push');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // serve your static client if needed

// 1) Generate VAPID keys once with web-push (or use below to generate)
// const vapidKeys = webpush.generateVAPIDKeys(); console.log(vapidKeys);
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '<PUT_YOUR_PUBLIC_KEY_HERE>';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '<PUT_YOUR_PRIVATE_KEY_HERE>';

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// In-memory storage for demo: { subscriptions: [ {endpoint, keys...} ], tasks: [...] }
const SUBSCRIPTIONS = []; // store subscription objects
const SCHEDULED = []; // store scheduled timeouts so we can clear if task deleted (demo)

app.get('/vapidPublicKey', (req, res) => {
  res.send(VAPID_PUBLIC_KEY);
});

// Save subscription endpoint (called from client)
app.post('/save-subscription', (req, res) => {
  const subscription = req.body;
  // Avoid duplicates (very simple check)
  if (!SUBSCRIPTIONS.find(s => s.endpoint === subscription.endpoint)) {
    SUBSCRIPTIONS.push(subscription);
  }
  res.json({ ok: true });
});

// Endpoint to add task and schedule notifications for it
// Expected body: { text, timeISO }  (timeISO = task start time in ISO format)
app.post('/schedule-task-reminders', (req, res) => {
  const { text, timeISO } = req.body;
  if (!text || !timeISO) return res.status(400).json({ error: 'missing fields' });

  const taskStart = new Date(timeISO).getTime();
  if (isNaN(taskStart)) return res.status(400).json({ error: 'invalid time' });

  // times before start: 1 hour and 5 minutes
  const reminders = [
    { when: taskStart - 60 * 60 * 1000, label: 'Task in 1 hour' },
    { when: taskStart - 5 * 60 * 1000, label: 'Task in 5 minutes' }
  ];

  reminders.forEach(r => {
    const delay = r.when - Date.now();
    if (delay <= 0) return; // skip past reminders
    const timeout = setTimeout(() => {
      sendNotificationToAll({
        title: `🔔 ${r.label}`,
        body: `${text}`,
        url: '/'
      }).catch(err => console.error('push send error', err));
    }, delay);
    SCHEDULED.push({ timeout, forTask: timeISO, when: r.when, label: r.label });
  });

  res.json({ ok: true, scheduledCount: SCHEDULED.length });
});

async function sendNotificationToAll(payload) {
  const sendPromises = SUBSCRIPTIONS.map(sub => webpush.sendNotification(sub, JSON.stringify(payload)).catch(err => {
    // remove unsubscribed endpoints or log errors
    console.error('Error sending to subscription', err);
  }));
  await Promise.all(sendPromises);
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Push server running on port ${PORT}`);
  console.log('VAPID public key:', VAPID_PUBLIC_KEY);
});
