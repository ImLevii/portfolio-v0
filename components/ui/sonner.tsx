"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"
import { useIsMobile } from "@/components/ui/use-mobile"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()
  const isMobile = useIsMobile()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position={isMobile ? "top-center" : "top-right"}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-black/60 group-[.toaster]:backdrop-blur-xl group-[.toaster]:border-white/10 group-[.toaster]:text-white group-[.toaster]:shadow-[0_0_15px_rgba(0,0,0,0.5)] font-sans border",
          description: "group-[.toast]:text-gray-400",
          actionButton:
            "group-[.toast]:bg-emerald-600 group-[.toast]:text-white font-bold",
          cancelButton:
            "group-[.toast]:bg-white/10 group-[.toast]:text-gray-300",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
