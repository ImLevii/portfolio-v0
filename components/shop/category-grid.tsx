import Link from "next/link"
import { Box } from "lucide-react"

interface CategoryGridProps {
    categories: {
        id: string
        name: string
        slug: string
        image?: string | null
    }[]
}

export function CategoryGrid({ categories }: CategoryGridProps) {
    if (categories.length === 0) return null

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {categories.map((category) => (
                <Link
                    key={category.id}
                    href={`/shop/category/${category.slug}`}
                    className="group relative overflow-hidden rounded-xl aspect-[16/9] border border-gray-800/50 hover:border-green-500/50 transition-all duration-300 shadow-lg hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] block"
                >
                    {/* Background Image */}
                    {category.image ? (
                        <img
                            src={category.image}
                            alt={category.name}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                            <Box className="w-12 h-12 text-gray-700" />
                        </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                    {/* Content */}
                    <div className="absolute inset-x-0 bottom-0 p-4 transition-transform duration-300 translate-y-2 group-hover:translate-y-0">
                        <h3 className="text-lg font-bold font-orbitron text-white uppercase tracking-wider group-hover:text-green-400 transition-colors">
                            {category.name}
                        </h3>
                        <div className="h-0.5 w-0 bg-green-500 group-hover:w-full transition-all duration-500 mt-2" />
                    </div>
                </Link>
            ))}
        </div>
    )
}
