"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getCarouselItems() {
    return await db.carouselItem.findMany({
        orderBy: {
            order: "asc",
        },
    })
}

export async function createCarouselItem(data: {
    title: string
    subtitle: string
    description: string
    cta: string
    color: string
    accent: string
    button: string
}) {
    await db.carouselItem.create({
        data,
    })
    revalidatePath("/shop")
    revalidatePath("/admin/carousel")
}

export async function updateCarouselItem(id: string, data: {
    title?: string
    subtitle?: string
    description?: string
    cta?: string
    color?: string
    accent?: string
    button?: string
    isActive?: boolean
}) {
    await db.carouselItem.update({
        where: { id },
        data,
    })
    revalidatePath("/shop")
    revalidatePath("/admin/carousel")
}

export async function deleteCarouselItem(id: string) {
    await db.carouselItem.delete({
        where: { id },
    })
    revalidatePath("/shop")
    revalidatePath("/admin/carousel")
}

export async function reorderCarouselItems(items: { id: string; order: number }[]) {
    for (const item of items) {
        await db.carouselItem.update({
            where: { id: item.id },
            data: { order: item.order },
        })
    }
    revalidatePath("/shop")
    revalidatePath("/admin/carousel")
}

export async function seedCarouselItems() {
    const defaultSlides = [
        {
            title: "NEW ARRIVALS",
            subtitle: "CHECK OUT THE LATEST TOOLS",
            description: "Upgrade your workflow with our newest developer assets.",
            cta: "BROWSE NOW",
            color: "from-green-500 to-emerald-700",
            accent: "text-green-400",
            button: "bg-green-600 hover:bg-green-700 text-white shadow-green-900/20 hover:shadow-green-500/40",
            order: 0
        },
        {
            title: "LIMITED OFFER",
            subtitle: "GET 50% OFF UI BUNDLE",
            description: "Complete collection of React components at half price.",
            cta: "GRAB DEAL",
            color: "from-emerald-500 to-teal-700",
            accent: "text-emerald-400",
            button: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/20 hover:shadow-emerald-500/40",
            order: 1
        },
        {
            title: "PREMIUM ICONS",
            subtitle: "PIXEL PERFECT VECTORS",
            description: "Over 200+ custom icons for your next big project.",
            cta: "VIEW PACK",
            color: "from-lime-500 to-green-700",
            accent: "text-lime-400",
            button: "bg-lime-600 hover:bg-lime-700 text-white shadow-lime-900/20 hover:shadow-lime-500/40",
            order: 2
        }
    ]

    for (const slide of defaultSlides) {
        await db.carouselItem.create({
            data: slide
        })
    }
    revalidatePath("/shop")
    revalidatePath("/admin/carousel")
}
