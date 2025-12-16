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
const clientId = env.PAYPAL_CLIENT_ID || env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const clientSecret = env.PAYPAL_CLIENT_SECRET || env.NEXT_PUBLIC_PAYPAL_CLIENT_SECRET;

console.log("---------------------------------------------------");
console.log("PayPal Credential Verification Script");
console.log("---------------------------------------------------");
console.log("Loaded Keys:", Object.keys(env));

if (!clientId || !clientSecret) {
    console.error("❌ Missing PayPal credentials in .env.local");
    console.log("Found ClientID:", !!clientId);
    console.log("Found Secret:", !!clientSecret);
    process.exit(1);
}

console.log(`Client ID: ${clientId.substring(0, 4)}...${clientId.substring(clientId.length - 4)}`);
console.log(`Secret:    ${clientSecret.substring(0, 4)}...${clientSecret.substring(clientSecret.length - 4)}`);
console.log("---------------------------------------------------");

async function testAuth(url, mode) {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    return new Promise((resolve) => {
        const req = https.request(`${url}/v1/oauth2/token`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log(`✅ SUCCESS: Credentials are valid for ${mode} environment!`);
                    resolve(true);
                } else {
                    console.log(`❌ FAILED: Credentials invalid for ${mode} environment (Status: ${res.statusCode})`);
                    // console.log(`   Response: ${data}`); 
                    resolve(false);
                }
            });
        });

        req.on('error', (e) => {
            console.error(`❌ Error connecting to ${mode}:`, e.message);
            resolve(false);
        });

        req.write('grant_type=client_credentials');
        req.end();
    });
}

(async () => {
    console.log("Testing against SANDBOX...");
    const sandboxValid = await testAuth('https://api-m.sandbox.paypal.com', 'SANDBOX');

    console.log("\nTesting against LIVE...");
    const liveValid = await testAuth('https://api-m.paypal.com', 'LIVE');

    console.log("---------------------------------------------------");
    console.log("SUMMARY:");
    if (sandboxValid && liveValid) {
        console.log("⚠️  Credentials work on BOTH? (Unlikely, but okay)");
    } else if (sandboxValid) {
        console.log("👉 These are SANDBOX credentials.");
        console.log("   Ensure your app is running in SANDBOX mode or using the Sandbox API URL.");
    } else if (liveValid) {
        console.log("👉 These are LIVE credentials.");
        console.log("   Ensure your app is running in LIVE mode or using the Live API URL.");
    } else {
        console.log("❌ These credentials are INVALID for both environments.");
        console.log("   Please check for typos or regenerate them in the PayPal Developer Dashboard.");
    }
    console.log("---------------------------------------------------");
})();
