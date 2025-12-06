const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const methods = [
        { name: 'stripe', displayName: 'Stripe' },
        { name: 'paypal', displayName: 'PayPal' },
        { name: 'bank_transfer', displayName: 'Bank Transfer' },
    ]

    for (const method of methods) {
        const existing = await prisma.paymentMethod.findUnique({
            where: { name: method.name },
        })

        if (!existing) {
            console.log(`Creating ${method.displayName}...`)
            await prisma.paymentMethod.create({
                data: {
                    name: method.name,
                    displayName: method.displayName,
                    isEnabled: false,
                },
            })
        } else {
            console.log(`${method.displayName} already exists.`)
        }
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
