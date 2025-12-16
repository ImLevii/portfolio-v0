const fs = require('fs');
const path = require('path');

const REQUIRED_VARS = [
    'NEXT_PUBLIC_PAYPAL_CLIENT_ID',
    'NEXT_PUBLIC_PAYPAL_CLIENT_SECRET',
    // 'NEXT_PUBLIC_PAYPAL_API_URL', // Optional, defaults used if missing
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'AUTH_SECRET',
    'DATABASE_URL'
];

console.log("🔍 Verifying Environment Variables...");

// Try to load .env.local for local dev checkout
const envPath = path.resolve(process.cwd(), '.env.local');
let loadedEnv = {};

if (fs.existsSync(envPath)) {
    console.log("   Loading .env.local...");
    const content = fs.readFileSync(envPath, 'utf8');
    content.split(/\r?\n/).forEach(line => {
        line = line.trim();
        if (!line || line.startsWith('#')) return;

        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            let key = match[1].trim();
            let value = match[2].trim();
            // Remove quotes if present
            value = value.replace(/^["']|["']$/g, '');
            loadedEnv[key] = value;
        }
    });
}

const missing = [];
const warnings = [];

REQUIRED_VARS.forEach(varName => {
    // Check Process Env (CI/CD/Vercel) first, then loaded .env
    const value = process.env[varName] || loadedEnv[varName];

    if (!value) {
        missing.push(varName);
    } else {
        if (varName.includes('KEY') || varName.includes('SECRET')) {
            console.log(`   ✅ ${varName} is set`);
        } else {
            console.log(`   ✅ ${varName} = ${value}`);
        }
    }
});

// Check for APP_URL specifically
const appUrl = process.env.NEXT_PUBLIC_APP_URL || loadedEnv['NEXT_PUBLIC_APP_URL'];
if (!appUrl) {
    warnings.push("⚠️  NEXT_PUBLIC_APP_URL is not set. This may cause redirect issues in Production.");
} else {
    console.log(`   ✅ NEXT_PUBLIC_APP_URL = ${appUrl}`);
}

if (warnings.length > 0) {
    console.log("\nWarnings:");
    warnings.forEach(w => console.log(w));
}

if (missing.length > 0) {
    console.error("\n❌ Missing Required Environment Variables:");
    missing.forEach(m => console.error(`   - ${m}`));
    console.error("\nPlease add these to your Vercel Project Settings or .env.local file.");
    process.exit(1);
}

console.log("\n✅ All required environment variables are present.\n");
