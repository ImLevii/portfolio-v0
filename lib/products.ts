export interface Product {
    id: string
    name: string
    description: string
    price: number // in cents
    image: string
    features: string[]
    category: string
}

export const products: Product[] = [
    {
        id: "prod_starter_kit",
        name: "Developer Starter Kit",
        description: "Essential tools and config files to jumpstart your next project.",
        price: 2900,
        image: "/images/products/starter-kit.jpg",
        features: [
            "VS Code Settings",
            "ESLint & Prettier Configs",
            "Git Hooks",
            "Readme Templates"
        ],
        category: "Templates"
    },
    {
        id: "prod_pro_icons",
        name: "Pro Icon Pack",
        description: "200+ custom designed icons for modern web applications.",
        price: 4900,
        image: "/images/products/icons.jpg",
        features: [
            "SVG & PNG formats",
            "Figma source files",
            "React components",
            "Commercial license"
        ],
        category: "Icons"
    },
    {
        id: "prod_ui_bundle",
        name: "Ultimate UI Bundle",
        description: "Complete collection of React components and layouts.",
        price: 9900,
        image: "/images/products/ui-bundle.jpg",
        features: [
            "50+ Components",
            "10+ Page Layouts",
            "Dark Mode Support",
            "TypeScript Ready"
        ],
        category: "UI Kits"
    }
]
