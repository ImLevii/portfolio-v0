const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const products = [
    {
        id: "prod_starter_kit",
        name: "Developer Starter Kit",
        description: "Essential tools and config files to jumpstart your next project.",
        price: 2900,
        image: "/images/products/starter-kit.jpg",
        features: JSON.stringify([
            "VS Code Settings",
            "ESLint & Prettier Configs",
            "Git Hooks",
            "Readme Templates"
        ]),
        category: "Templates"
    },
    {
        id: "prod_pro_icons",
        name: "Pro Icon Pack",
        description: "200+ custom designed icons for modern web applications.",
        price: 4900,
        image: "/images/products/icons.jpg",
        features: JSON.stringify([
            "SVG & PNG formats",
            "Figma source files",
            "React components",
            "Commercial license"
        ]),
        category: "Icons"
    },
    {
        id: "prod_ui_bundle",
        name: "Ultimate UI Bundle",
        description: "Complete collection of React components and layouts.",
        price: 9900,
        image: "/images/products/ui-bundle.jpg",
        features: JSON.stringify([
            "50+ Components",
            "10+ Page Layouts",
            "Dark Mode Support",
            "TypeScript Ready"
        ]),
        category: "UI Kits"
    }
]

async function main() {
    console.log('Start seeding ...')
    for (const p of products) {
        const product = await prisma.product.upsert({
            where: { id: p.id },
            update: {},
            create: p,
        })
        console.log(`Created product with id: ${product.id}`)
    }
    console.log('Seeding finished.')
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
