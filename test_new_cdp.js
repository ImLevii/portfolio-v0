const https = require('https');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const keyName = process.env.COINBASE_CDP_API_KEY_NAME;
const privateKey = process.env.COINBASE_CDP_PRIVATE_KEY;

async function testCommercePaymentLink() {
    console.log("Testing Commerce Payment Link with CDP...");
    const host = 'api.commerce.coinbase.com';
    const path = '/payment_links';
    const method = 'POST';

    const token = jwt.sign(
        {
            iss: 'coinbase',
            nbf: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 120,
            sub: keyName,
            uri: `${method} ${host}${path}`
        },
        privateKey.replace(/\\n/g, '\n'),
        {
            algorithm: 'ES256',
            header: {
                kid: keyName,
                nonce: crypto.randomBytes(16).toString('hex')
            }
        }
    );

    return new Promise((resolve) => {
        const body = JSON.stringify({
            name: "Test Charge",
            description: "Testing CDP Auth",
            pricing_type: "fixed_price",
            local_price: {
                amount: "1.00",
                currency: "USD"
            }
        });

        const options = {
            hostname: host,
            port: 443,
            path: path,
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-CC-Version': '2018-03-22'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                resolve({ statusCode: res.statusCode, data });
            });
        });

        req.on('error', (e) => resolve({ statusCode: 0, data: e.message }));
        req.write(body);
        req.end();
    });
}

(async () => {
    const res = await testCommercePaymentLink();
    console.log(`Status: ${res.statusCode}`);
    console.log(`Response: ${res.data}`);
})();
