# Bypasser

A Node.js backend that bypasses Linkvertise, Luarmor, LootLabs, and similar link services.

## Deploy on Railway

1. Connect this repo to Railway
2. Railway auto-detects Node.js and runs `npm start`
3. Get your Railway URL and use it in the frontend

## API

`GET /bypass?url=YOUR_LINK_HERE`

Returns JSON with `{ success: true, result: 'bypassed_url' }`
