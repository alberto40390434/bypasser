const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/bypass', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'No URL provided' });

  try {
    const response = await fetch(`https://bypass.vip/v2?url=${encodeURIComponent(url)}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Bypass failed', details: err.message });
  }
});

app.listen(PORT, () => console.log(`Bypasser running on port ${PORT}`));
