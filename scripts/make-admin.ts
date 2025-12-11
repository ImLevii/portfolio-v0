
import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()

async function main() {
    const email = "server.meteorinvestments@gmail.com"

    console.log(`Checking for user: ${email}...`)

    const user = await db.user.findUnique({
        where: { email },
    })

    if (!user) {
        console.error(`User with email ${email} not found. Please sign up first!`)
        return
    }

    console.log(`User found: ${user.name} (${user.id}). Current Role: ${user.role}`)

    if (user.role === "ADMIN") {
        console.log("User is already an ADMIN.")
        return
    }

    const updatedUser = await db.user.update({
        where: { email },
        data: { role: "ADMIN" },
    })

    console.log(`Success! User ${updatedUser.name} is now an ADMIN.`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await db.$disconnect()
    })
