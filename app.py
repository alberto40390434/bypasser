from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import re
import time
import json
import base64

app = Flask(__name__)
CORS(app)

def bypass_linkvertise(url):
    session = requests.Session()
    headers = {
        "User-Agent": "AppleTV6,2/11.1",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    session.headers.update(headers)

    url = url.replace("%3D", " ").replace("&o=sharing", "").replace("?o=sharing", "").replace("dynamic?r=", "dynamic/?r=")
    id_name = re.search(r"\/\d+\/[^\/]+", url)
    if not id_name:
        return None

    paths = [
        "/captcha",
        "/countdown_impression?trafficOrigin=network",
        "/todo_impression?mobile=true&trafficOrigin=network"
    ]
    for path in paths:
        req_url = f"https://publisher.linkvertise.com/api/v1/redirect/link{id_name[0]}{path}"
        try:
            response = session.get(req_url, timeout=10).json()
            if response.get("success"):
                break
        except:
            pass

    data = session.get(f"https://publisher.linkvertise.com/api/v1/redirect/link/static{id_name[0]}", timeout=10).json()
    out = {
        'timestamp': int(str(time.time_ns())[0:13]),
        'random': '6548307',
        'link_id': data["data"]["link"]["id"]
    }
    options = {'serial': base64.b64encode(json.dumps(out).encode()).decode()}

    account_data = session.get("https://publisher.linkvertise.com/api/v1/account", timeout=10).json()
    user_token = account_data.get("user_token")

    url_submit = f"https://publisher.linkvertise.com/api/v1/redirect/link{id_name[0]}/target?X-Linkvertise-UT={user_token}"
    result = session.post(url_submit, json=options, timeout=10).json()

    if result.get("success") and result.get("data") and result["data"].get("target"):
        target = result["data"]["target"]
        if isinstance(target, dict):
            return target.get("url") or target.get("value")
        return target
    return None

def bypass_via_bypassvip(url):
    try:
        r = requests.get(f"https://bypass.vip/api?url={url}", timeout=15)
        data = r.json()
        if data.get("status") == "success":
            return data.get("result")
    except:
        pass
    return None

@app.route('/')
def index():
    return 'Bypasser backend is running!'

@app.route('/bypass')
def bypass():
    url = request.args.get('url')
    if not url:
        return jsonify({'error': 'No URL provided'}), 400

    result = None

    if 'linkvertise' in url:
        result = bypass_linkvertise(url)

    if not result:
        result = bypass_via_bypassvip(url)

    if result:
        return jsonify({'result': result})
    else:
        return jsonify({'error': 'Failed to bypass link'}), 500

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 3000))
    app.run(host='0.0.0.0', port=port)
