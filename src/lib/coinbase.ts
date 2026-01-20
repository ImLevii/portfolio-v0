import { db } from "@/lib/db";

const COINBASE_COMMERCE_API_URL = "https://api.commerce.coinbase.com";

interface CoinbaseConfig {
    apiKey: string;
    webhookSecret: string;
    mode: "live" | "sandbox" | "test"; // 'test' maps to sandbox behavior for consistency if needed
}

interface CreateChargeParams {
    name: string;
    description: string;
    pricing_type: "fixed_price" | "no_price";
    local_price?: {
        amount: string;
        currency: string;
    };
    metadata?: Record<string, string>;
    redirect_url?: string;
    cancel_url?: string;
}

interface CoinbaseCharge {
    id: string;
    code: string;
    hosted_url: string;
    created_at: string;
    pricing: {
        local: {
            amount: string;
            currency: string;
        };
    };
    metadata: Record<string, any>;
    timeline: any[];
}

export async function getCoinbaseConfig(): Promise<CoinbaseConfig | null> {
    // 1. Try DB
    try {
        const paymentMethod = await db.paymentMethod.findUnique({
            where: { name: "coinbase" },
        });

        if (paymentMethod && paymentMethod.isEnabled && paymentMethod.config) {
            const config = JSON.parse(paymentMethod.config);
            if (config.apiKey) {
                return {
                    apiKey: config.apiKey,
                    webhookSecret: config.webhookSecret || process.env.COINBASE_WEBHOOK_SECRET || "",
                    mode: config.mode || "live",
                };
            }
        }
    } catch (error) {
        console.error("Error fetching Coinbase config from DB:", error);
    }

    // 2. Fallback to Env
    const envApiKey = process.env.COINBASE_API_KEY;
    if (envApiKey) {
        return {
            apiKey: envApiKey,
            webhookSecret: process.env.COINBASE_WEBHOOK_SECRET || "",
            mode: (process.env.COINBASE_ENV as "live" | "sandbox") || "live",
        };
    }

    return null;
}

export async function createCharge(params: CreateChargeParams): Promise<CoinbaseCharge> {
    const config = await getCoinbaseConfig();
    if (!config) {
        throw new Error("Coinbase is not configured.");
    }

    const response = await fetch(`${COINBASE_COMMERCE_API_URL}/charges`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CC-Api-Key": config.apiKey,
            "X-CC-Version": "2018-03-22",
        },
        body: JSON.stringify(params),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Coinbase Charge Creation Failed: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    const data = await response.json();
    return data.data as CoinbaseCharge;
}

export async function getCharge(chargeId: string): Promise<CoinbaseCharge> {
    const config = await getCoinbaseConfig();
    if (!config) {
        throw new Error("Coinbase is not configured.");
    }

    const response = await fetch(`${COINBASE_COMMERCE_API_URL}/charges/${chargeId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "X-CC-Api-Key": config.apiKey,
            "X-CC-Version": "2018-03-22",
        },
    });

    if (!response.ok) {
        throw new Error(`Coinbase Charge Fetch Failed: ${response.status}`);
    }

    const data = await response.json();
    return data.data as CoinbaseCharge;
}
