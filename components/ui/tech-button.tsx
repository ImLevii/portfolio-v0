"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative group overflow-hidden",
    {
        variants: {
            variant: {
                default: "bg-gradient-to-r from-gray-800/60 to-gray-900/60 border border-gray-700/40 backdrop-blur-sm hover:bg-gray-800/80 text-white shadow-lg",
                outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                ghost: "hover:bg-accent hover:text-accent-foreground",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-8",
                icon: "h-10 w-10",
            },
            glowColor: {
                emerald: "shadow-emerald-500/20",
                red: "shadow-red-500/20",
                blue: "shadow-blue-500/20",
                purple: "shadow-purple-500/20",
            }
        },
        defaultVariants: {
            variant: "default",
            size: "default",
            glowColor: "emerald",
        },
    }
)

export interface TechButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
    glowColor?: "emerald" | "red" | "blue" | "purple"
}

const TechButton = React.forwardRef<HTMLButtonElement, TechButtonProps>(
    ({ className, variant, size, glowColor = "emerald", asChild = false, children, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"

        const glowColors = {
            emerald: "rgba(16, 185, 129, 0.8)",
            red: "rgba(239, 68, 68, 0.8)",
            blue: "rgba(59, 130, 246, 0.8)",
            purple: "rgba(168, 85, 247, 0.8)",
        }

        const shadowColor = glowColors[glowColor] || glowColors.emerald

        return (
            <Comp
                className={cn(buttonVariants({ variant, size, glowColor, className }))}
                ref={ref}
                style={{
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.3)`
                }}
                {...props}
            >
                <span className="relative z-10 flex items-center gap-2">
                    {children}
                </span>

                {/* Hover Glow Effect */}
                <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                        background: `radial-gradient(circle at center, ${shadowColor.replace('0.8', '0.1')} 0%, transparent 70%)`
                    }}
                />
            </Comp>
        )
    }
)
TechButton.displayName = "TechButton"

export { TechButton, buttonVariants }
