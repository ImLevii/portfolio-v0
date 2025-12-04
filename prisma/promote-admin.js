const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const email = 'admin@example.com'
    const user = await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN' },
    })
    console.log(`User ${user.email} promoted to ${user.role}`)
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
