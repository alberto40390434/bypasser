const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Bypasser API is running!');
});

app.get('/bypass', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'No URL provided' });

  try {
    // Try bypass.vip first
    const response = await axios.get(`https://bypass.vip/api?url=${encodeURIComponent(url)}`, {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    const data = response.data;
    
    if (data && data.destination) {
      return res.json({ success: true, result: data.destination });
    } else if (data && data.result) {
      return res.json({ success: true, result: data.result });
    } else {
      return res.json({ success: false, error: 'Could not bypass this link', raw: data });
    }
  } catch (err) {
    // Try bypass.city as fallback
    try {
      const fallback = await axios.get(`https://bypass.city/api?url=${encodeURIComponent(url)}`, {
        timeout: 15000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      const fdata = fallback.data;
      if (fdata && (fdata.destination || fdata.result)) {
        return res.json({ success: true, result: fdata.destination || fdata.result });
      }
    } catch (e) {}
    
    return res.status(500).json({ error: 'Bypass failed: ' + err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Bypasser running on port ${PORT}`));
