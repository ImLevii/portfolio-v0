const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

// Load env vars manually to avoid dependencies
function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (!fs.existsSync(envPath)) {
            console.error("❌ .env.local not found at:", envPath);
            return {};
        }
        console.log("Reading .env.local from:", envPath);
        const envContent = fs.readFileSync(envPath, 'utf8');
        const env = {};
        envContent.split(/\r?\n/).forEach(line => {
            line = line.trim();
            if (!line || line.startsWith('#')) return;

            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["']|["']$/g, '');
                env[key] = value;
            }
        });
        return env;
    } catch (e) {
        console.error("❌ Failed to read .env.local", e);
        return {};
    }
}

const env = loadEnv();
const apiKey = env.COINBASE_API_KEY || env.NEXT_PUBLIC_COINBASE_API_KEY;
const apiSecret = env.COINBASE_API_SECRET || env.NEXT_PUBLIC_COINBASE_API_SECRET;

console.log("---------------------------------------------------");
console.log("Coinbase Credential Verification Script");
console.log("---------------------------------------------------");
console.log("Loaded Keys:", Object.keys(env));

if (!apiKey || !apiSecret) {
    console.error("❌ Missing Coinbase credentials in .env.local");
    console.log("Found API Key:", !!apiKey);
    console.log("Found API Secret:", !!apiSecret);
    process.exit(1);
}

console.log(`API Key:    ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
console.log(`API Secret: ${apiSecret.substring(0, 8)}...${apiSecret.substring(apiSecret.length - 4)}`);
console.log("---------------------------------------------------");

function generateSignature(timestamp, method, path, body, secret) {
    const message = timestamp + method + path + (body || '');
    return crypto.createHmac('sha256', secret).update(message).digest('hex');
}

async function testAuth(url, mode) {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const method = 'GET';
    const path = '/v2/user';
    const signature = generateSignature(timestamp, method, path, '', apiSecret);

    return new Promise((resolve) => {
        const req = https.request(`${url}${path}`, {
            method: method,
            headers: {
                'CB-ACCESS-KEY': apiKey,
                'CB-ACCESS-SIGN': signature,
                'CB-ACCESS-TIMESTAMP': timestamp,
                'CB-VERSION': '2021-01-01'
            }
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log(`✅ SUCCESS: Credentials are valid for ${mode} environment!`);
                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.data && parsed.data.name) {
                            console.log(`   Account: ${parsed.data.name}`);
                        }
                    } catch (e) {}
                    resolve(true);
                } else {
                    console.log(`❌ FAILED: Credentials invalid for ${mode} environment (Status: ${res.statusCode})`);
                    // Uncomment to see error details:
                    // console.log(`   Response: ${data}`);
                    resolve(false);
                }
            });
        });

        req.on('error', (e) => {
            console.error(`❌ Error connecting to ${mode}:`, e.message);
            resolve(false);
        });

        req.end();
    });
}

(async () => {
    console.log("Testing against SANDBOX...");
    const sandboxValid = await testAuth('https://api.sandbox.coinbase.com', 'SANDBOX');

    console.log("\nTesting against PRODUCTION...");
    const productionValid = await testAuth('https://api.coinbase.com', 'PRODUCTION');

    console.log("---------------------------------------------------");
    console.log("SUMMARY:");
    if (sandboxValid && productionValid) {
        console.log("⚠️  Credentials work on BOTH? (Unlikely, but okay)");
    } else if (sandboxValid) {
        console.log("👉 These are SANDBOX credentials.");
        console.log("   Ensure your app is using the Sandbox API URL:");
        console.log("   https://api.sandbox.coinbase.com");
    } else if (productionValid) {
        console.log("👉 These are PRODUCTION credentials.");
        console.log("   Ensure your app is using the Production API URL:");
        console.log("   https://api.coinbase.com");
    } else {
        console.log("❌ These credentials are INVALID for both environments.");
        console.log("   Please check for typos or regenerate them in the Coinbase Developer Dashboard.");
        console.log("   Note: Ensure API permissions include 'wallet:user:read' at minimum.");
    }
    console.log("---------------------------------------------------");
})();