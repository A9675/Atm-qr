const express = require('express');
const cors = require('cors');
const webpush = require('web-push');
const { GoogleSpreadsheet } = require('google-spreadsheet');

const app = express();
app.use(cors());
app.use(express.json());

const VAPID_KEYS = {
  publicKey: '   e: 01 00 01  n: 00 A2 41 F0 C1 4B 8E 97 D3 96 4D 58 92 5F 76 B8 A2 8E AE 5B 46 14 2D CA F4 13 05 97 A6 11 7A 47 70 9F 09 8C D5 60 D9 CA B4 1D 52 D9 19 1A 5D A6 69 66 C4 85 23 80 83 F1 C9 33 43 ED A1 BB 04 E2 93 
     ',
  privateKey: 'p: 00 F1 FB 4B EE B1 6F 02 3E 81 90 C4 AC 36 8B 7B 7A E2 59 F0 B6 7B 40 E1 96 FB A5 F7 A9 2D 23 6B 8F   q: 00 AB A8 4C 4C 9D E5 05 E7 2B F2 7C 23 91 72 E4 FB E0 27 66 C5 ED 9A BE 20 69 1A 28 3A 29 04 E6 BD   d: 2B AF 8F 4F AB B5 27 A1 9B 2D 15 F4 CA E9 1F 0A FD 59 6A 4F B2 ED 25 60 93 A2 84 D2 FC 8F AC 9D F1 85 6E D6 F0 72 D0 10 23 80 84 22 F1 9F 9F 28 96 1B 54 36 51 C3 4A DD 6A 79 C8 32 43 DB B2 A9 
  ',
};

webpush.setVapidDetails(
  'mailto:you@example.com',
  VAPID_KEYS.publicKey,
  VAPID_KEYS.privateKey
);

// Google Sheets setup
const doc = new GoogleSpreadsheet('https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLhRmQHMI9kWnmiS9Dn3B9mSpldQrUxDSnE8xnbfVVLVfNWutc6WydiP1hIRNpi5LNI973QHQvHuMTqFVptV4qz03kPitorDV8hN5xef3CC4Zb4lg4wwdVWa0f0j60_7WfESbI8TJZz_SfeDLFL59WbVLoQ1X6FSKlp6y-TXjk-K8mjfdZwDCKGKdpEHIWcKeZ8iAD6mITnyKtnpMpLfiADTgfQmdELmKc5loG2GA1kJ8jmtH8PKU5pdJzU_jfenqBU6x4b230vGawQ1djFWtTfya2KClw&lib=MHs_dMiYTx3gHtNbB5UJzX9mFulhg_8-J ');
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
