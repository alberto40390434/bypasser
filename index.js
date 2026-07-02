const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Bypasser backend is running!');
});

app.get('/bypass', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'No URL provided' });

  try {
    const response = await axios.get(`https://bypass.vip/api?url=${encodeURIComponent(url)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 15000
    });
    return res.json(response.data);
  } catch (err) {
    console.error('bypass.vip error:', err.message);
  }

  try {
    const response = await axios.get(`https://api.bypass.city/bypass?url=${encodeURIComponent(url)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 15000
    });
    return res.json(response.data);
  } catch (err) {
    console.error('bypass.city error:', err.message);
  }

  return res.status(500).json({ error: 'All bypass methods failed' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
