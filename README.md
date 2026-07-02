# Bypasser
A simple backend that proxies bypass.vip API calls to avoid CORS issues.

## Deploy on Railway
1. Connect this repo to Railway
2. Railway auto-detects Node.js and runs `npm start`
3. Use the generated domain as your backend URL

## Endpoints
- `GET /` - Health check
- `POST /bypass` - Body: `{ "url": "your-link-here" }` - Returns bypassed link
