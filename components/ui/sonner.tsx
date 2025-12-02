"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-white group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:data-[button]:bg-primary group-[.toast]:data-[button]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:data-[button]:bg-muted group-[.toast]:data-[button]:text-muted-foreground",
          error: "group-[.toaster]:bg-[#FA6E80] group-[.toaster]:text-white group-[.toaster]:border-none",
          success: "group-[.toaster]:bg-[#31A7AC] group-[.toaster]:text-white group-[.toaster]:border-none",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
