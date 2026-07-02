const express = require('express');
const https = require('https');
const http = require('http');
const { URL } = require('url');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.get('/', (req, res) => {
  res.json({ status: 'Bypasser backend is running!' });
});

// Helper: fetch a URL and follow redirects manually
function fetchUrl(urlStr, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(urlStr);
    const lib = parsedUrl.protocol === 'https:' ? https : http;
    const reqOptions = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        ...(options.headers || {})
      },
      timeout: 10000
    };
    const req = lib.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timed out')); });
    req.end();
  });
}

// Linkvertise bypass via their internal API
async function bypassLinkvertise(url) {
  try {
    // Extract the ID from linkvertise URL
    const match = url.match(/linkvertise\.com\/(?:url\/)?([\d]+)\/([\w-]+)/) ||
                  url.match(/linkvertise\.com\/([\d]+)\/([\w-]+)/) ||
                  url.match(/linkvertise\.com\/access\/([\d]+)\/([\w-]+)/);
    if (!match) throw new Error('Could not parse Linkvertise URL');
    
    const userId = match[1];
    const urlId = match[2];
    
    // Try bypass.vip API (server-side, no CORS)
    const bypassVipUrl = `https://bypass.vip/api?url=${encodeURIComponent(url)}`;
    const resp = await fetchUrl(bypassVipUrl);
    const data = JSON.parse(resp.body);
    if (data.result) return data.result;
    if (data.destination) return data.destination;
    throw new Error('No result from bypass.vip');
  } catch (e) {
    throw new Error('Linkvertise bypass failed: ' + e.message);
  }
}

// Generic bypass using bypass.vip
async function bypassGeneric(url) {
  const apis = [
    `https://bypass.vip/api?url=${encodeURIComponent(url)}`,
    `https://api.bypass.city/v2/bypass?url=${encodeURIComponent(url)}`,
  ];
  
  for (const apiUrl of apis) {
    try {
      const resp = await fetchUrl(apiUrl);
      if (resp.status === 200) {
        const data = JSON.parse(resp.body);
        const result = data.result || data.destination || data.bypassed || data.url || data.link;
        if (result) return result;
      }
    } catch (e) {
      continue;
    }
  }
  throw new Error('All bypass APIs failed');
}

app.post('/bypass', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });
  
  console.log('Bypassing:', url);
  
  try {
    let result;
    if (url.includes('linkvertise.com')) {
      result = await bypassLinkvertise(url);
    } else {
      result = await bypassGeneric(url);
    }
    console.log('Success:', result);
    res.json({ success: true, result });
  } catch (e) {
    console.error('Error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Bypasser backend running on port ${PORT}`);
});
