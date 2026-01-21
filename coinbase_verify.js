const fs = require('fs');
const path = require('path');
const https = require('https');

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
// Try to find the API key in various likely variables
const apiKey = env.COINBASE_API_KEY || env.NEXT_COINBASE_API_KEY || env.NEXT_PUBLIC_COINBASE_API_KEY;

console.log("---------------------------------------------------");
console.log("Coinbase Commerce Verification Script");
console.log("---------------------------------------------------");

if (!apiKey) {
    console.error("❌ Missing Coinbase Commerce API Key in .env.local");
    console.log("   Expected one of: COINBASE_API_KEY, NEXT_COINBASE_API_KEY");
    process.exit(1);
}

// Mask key for display
const maskedKey = apiKey.length > 8 ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}` : '***';
console.log(`API Key: ${maskedKey}`);
console.log("---------------------------------------------------");

async function verifyCommerceKey() {
    return new Promise((resolve) => {
        const options = {
            hostname: 'api.commerce.coinbase.com',
            port: 443,
            path: '/charges?limit=1', // Fetching a list of charges to verify auth
            method: 'GET',
            headers: {
                'X-CC-Api-Key': apiKey,
                'X-CC-Version': '2018-03-22',
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log(`✅ SUCCESS: Coinbase Commerce API Key is valid!`);
                    console.log(`   Status: ${res.statusCode} OK`);
                    try {
                        const parsed = JSON.parse(data);
                        // Just showing we got some data back validly
                        console.log(`   Connection verified.`);
                    } catch (e) { }
                    resolve(true);
                } else {
                    console.log(`❌ FAILED: API Key is invalid or has insufficient permissions.`);
                    console.log(`   Status: ${res.statusCode} ${res.statusMessage}`);
                    console.log(`   Response: ${data}`);
                    resolve(false);
                }
            });
        });

        req.on('error', (e) => {
            console.error(`❌ Network Error:`, e.message);
            resolve(false);
        });

        req.end();
    });
}

(async () => {
    console.log("Testing Connection to Coinbase Commerce API...");
    await verifyCommerceKey();
    console.log("---------------------------------------------------");
})();