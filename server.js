const express = require('express');
const cors = require('cors');
const webpush = require('web-push');
const { GoogleSpreadsheet } = require('google-spreadsheet');

const app = express();
app.use(cors());
app.use(express.json());

const VAPID_KEYS = {
  publicKey: 'YOUR_PUBLIC_VAPID_KEY',
  privateKey: 'YOUR_PRIVATE_VAPID_KEY',
};

webpush.setVapidDetails(
  'mailto:you@example.com',
  VAPID_KEYS.publicKey,
  VAPID_KEYS.privateKey
);

// Google Sheets setup
const doc = new GoogleSpreadsheet('YOUR_SHEET_ID');
const SERVICE_ACCOUNT = require('./credentials.json');

async function loadSubscribers() {
  await doc.useServiceAccountAuth(SERVICE_ACCOUNT);
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle['Subscribers'];
  const rows = await sheet.getRows();

  return rows.map(row => ({
    endpoint: row._rawData[1],
    keys: {
      auth: row._rawData[2],
      p256dh: row._rawData[3],
    }
  }));
}

app.post('/send', async (req, res) => {
  const { title, body } = req.body;
  const subscriptions = await loadSubscribers();

  subscriptions.forEach(subscription => {
    webpush.sendNotification(subscription, JSON.stringify({ title, body }))
      .catch(err => console.error('Push Error:', err));
  });

  res.send("Notifications sent.");
});

app.listen(3000, () => console.log("Server running on port 3000"));
