import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const methods = [
        {
            name: 'stripe',
            displayName: 'Credit Card (Stripe)',
            isEnabled: true,
            config: JSON.stringify({}),
        },
        {
            name: 'bank_transfer',
            displayName: 'Bank Transfer',
            isEnabled: false,
            config: JSON.stringify({
                bankName: 'Example Bank',
                accountNumber: '1234567890',
                routingNumber: '987654321',
                instructions: 'Please transfer the total amount to the account above and include your order ID in the reference.',
            }),
        },
        {
            name: 'paypal',
            displayName: 'PayPal',
            isEnabled: true,
            config: JSON.stringify({
                clientId: "YOUR_PAYPAL_CLIENT_ID",
                mode: "sandbox"
            })
        }
    ]

    for (const method of methods) {
        await prisma.paymentMethod.upsert({
            where: { name: method.name },
            update: {},
            create: method,
        })
    }

    console.log('Payment methods seeded')
}

main()
    .catch(async (e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
