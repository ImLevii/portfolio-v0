const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const email = 'server.meteorgaming@gmail.com'
    console.log(`Checking for user: ${email}...`)

    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (!user) {
        console.error(`User with email ${email} not found!`)
        process.exit(1)
    }

    console.log(`Found user: ${user.name} (Current Role: ${user.role})`)

    const updated = await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN' }
    })

    console.log(`Successfully updated role to ADMIN for: ${updated.email}`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
