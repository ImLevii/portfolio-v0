const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const email = 'server.meteorinvestments@gmail.com'

    console.log(`Promoting user ${email} to ADMIN...`)

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            console.error(`User with email ${email} not found. Please sign up first.`)
            return
        }

        const updatedUser = await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' },
        })

        console.log(`Success! User ${email} is now an ADMIN.`)
    } catch (e) {
        console.error('Error promoting user:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
