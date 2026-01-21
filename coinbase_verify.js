const fs = require('fs');
const path = require('path');
const https = require('https');

/**
 * Load env vars manually
 */
function loadEnv() {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) {
        console.error("❌ .env.local not found at:", envPath);
        process.exit(1);
    }

    const env = {};
    fs.readFileSync(envPath, 'utf8')
        .split(/\r?\n/)
        .forEach(line => {
            line = line.trim();
            if (!line || line.startsWith('#')) return;
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
            }
        });

    return env;
}

const env = loadEnv();
const apiKey =
    env.COINBASE_API_KEY ||
    env.NEXT_COINBASE_API_KEY ||
    env.NEXT_PUBLIC_COINBASE_API_KEY;

console.log("---------------------------------------------------");
console.log("Coinbase Commerce API Verification");
console.log("---------------------------------------------------");

if (!apiKey) {
    console.error("❌ Missing Coinbase Commerce API Key");
    process.exit(1);
}

const maskedKey =
    apiKey.length > 8
        ? `${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`
        : "***";

console.log(`API Key: ${maskedKey}`);
console.log("---------------------------------------------------");

/**
 * Verify API key using a READ endpoint
 */
function verifyCommerceKey() {
    return new Promise(resolve => {
        const options = {
            hostname: 'api.commerce.coinbase.com',
            port: 443,
            path: '/charges?limit=1',
            method: 'GET',
            headers: {
                'X-CC-Api-Key': apiKey,
                'X-CC-Version': '2018-03-22'
            }
        };

        const req = https.request(options, res => {
            let data = '';
            res.on('data', d => (data += d));
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log("✅ API Key is valid and authenticated.");
                    resolve(true);
                } else {
                    console.error("❌ API Key verification failed.");
                    console.error(`Status: ${res.statusCode}`);
                    console.error(data);
                    resolve(false);
                }
            });
        });

        req.on('error', err => {
            console.error("❌ Network error:", err.message);
            resolve(false);
        });

        req.end();
    });
}

(async () => {
    const ok = await verifyCommerceKey();

    if (ok) {
        console.log("\nℹ️ IMPORTANT:");
        console.log("Dynamic charge/checkout creation via API is deprecated.");
        console.log("Use a pre-created Checkout instead:");
        console.log("https://commerce.coinbase.com/checkout/<CHECKOUT_ID>");
        console.log("\nWebhooks + hosted checkout is the supported flow.");
    }

    console.log("---------------------------------------------------");
})();