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

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://bypass.city/'
  };

  // Try bypass.city
  try {
    console.log('Trying bypass.city for:', url);
    const response = await axios.get(`https://bypass.city/api/v1/bypass?url=${encodeURIComponent(url)}`, {
      headers,
      timeout: 20000
    });
    console.log('bypass.city response:', JSON.stringify(response.data));
    if (response.data && (response.data.destination || response.data.bypassed_url || response.data.result)) {
      const result = response.data.destination || response.data.bypassed_url || response.data.result;
      return res.json({ result });
    }
    return res.json(response.data);
  } catch (err) {
    console.error('bypass.city error:', err.message, err.response?.status, JSON.stringify(err.response?.data));
  }

  // Try bypass.vip
  try {
    console.log('Trying bypass.vip for:', url);
    const response = await axios.get(`https://bypass.vip/api?url=${encodeURIComponent(url)}`, {
      headers: { ...headers, 'Referer': 'https://bypass.vip/' },
      timeout: 20000
    });
    console.log('bypass.vip response:', JSON.stringify(response.data));
    if (response.data && (response.data.destination || response.data.result)) {
      const result = response.data.destination || response.data.result;
      return res.json({ result });
    }
    return res.json(response.data);
  } catch (err) {
    console.error('bypass.vip error:', err.message, err.response?.status, JSON.stringify(err.response?.data));
  }

  // Try loot-link
  try {
    console.log('Trying loot-link for:', url);
    const response = await axios.get(`https://loot-link.com/api?bypass=${encodeURIComponent(url)}`, {
      headers,
      timeout: 20000
    });
    console.log('loot-link response:', JSON.stringify(response.data));
    if (response.data && response.data.result) {
      return res.json({ result: response.data.result });
    }
    return res.json(response.data);
  } catch (err) {
    console.error('loot-link error:', err.message, err.response?.status, JSON.stringify(err.response?.data));
  }

  return res.status(500).json({ error: 'All bypass methods failed. The link may not be supported or the services are down.' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
