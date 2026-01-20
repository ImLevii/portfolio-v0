import crypto from "crypto";
import { getCoinbaseConfig } from "./coinbase";

export async function verifyWebhookSignature(
    rawBody: string,
    signature: string
): Promise<boolean> {
    const config = await getCoinbaseConfig();
    if (!config || !config.webhookSecret) {
        console.warn("Coinbase webhook secret not configured.");
        return false;
    }

    const hmac = crypto.createHmac("sha256", config.webhookSecret);
    hmac.update(rawBody);
    const calculatedSignature = hmac.digest("hex");

    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(calculatedSignature)
    );
}
