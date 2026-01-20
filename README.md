# Portfolio Landing & E-Commerce

## Coinbase Commerce Integration

This project includes a native integration with Coinbase Commerce for cryptocurrency payments.

### Configuration

You can configure Coinbase in two ways:

1. **Admin Dashboard (Recommended)**:
   - Go to `/admin/settings/payments`
   - Enable "Coinbase"
   - Enter your API Key and Webhook Secret from [Coinbase Commerce Settings](https://commerce.coinbase.com/dashboard/settings)

2. **Environment Variables** (Fallback):
   - Set `COINBASE_API_KEY`
   - Set `COINBASE_WEBHOOK_SECRET`

### Webhooks

Webhooks are critical for confirming payments.
1. Add a new webhook endpoint in Coinbase Commerce: `https://your-domain.com/api/coinbase/webhook`
2. Subscribe to `charge:confirmed` and `charge:failed` events.
3. Copy the Shared Secret and save it in your Admin Dashboard or `.env`.

### Testing

To test locally:
1. Use `ngrok` or similar to expose your local server.
2. Update the webhook URL in Coinbase to your ngrok URL.
3. Create a small test charge and pay with Testnet Crypto if using Sandbox mode (requires specific Coinbase Commerce Sandbox account).
