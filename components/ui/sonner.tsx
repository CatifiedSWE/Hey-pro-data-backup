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
          toast: "group toast group-[.toaster]:bg-gradient-to-r group-[.toaster]:from-[#FA6E80] group-[.toaster]:to-[#31A7AC] group-[.toaster]:text-white group-[.toaster]:border-none group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-white group-[.toast]:opacity-90",
          actionButton:
            "group-[.toast]:data-[button]:bg-white group-[.toast]:data-[button]:text-[#FA6E80] group-[.toast]:data-[button]:hover:bg-gray-100",
          cancelButton:
            "group-[.toast]:data-[button]:bg-white/20 group-[.toast]:data-[button]:text-white group-[.toast]:data-[button]:hover:bg-white/30",
          error: "group-[.toaster]:bg-[#FA6E80] group-[.toaster]:text-white group-[.toaster]:border-none",
          success: "group-[.toaster]:bg-[#31A7AC] group-[.toaster]:text-white group-[.toaster]:border-none",
          info: "group-[.toaster]:bg-gradient-to-r group-[.toaster]:from-[#31A7AC] group-[.toaster]:to-[#FA6E80] group-[.toaster]:text-white group-[.toaster]:border-none",
          warning: "group-[.toaster]:bg-gradient-to-r group-[.toaster]:from-[#FA6E80] group-[.toaster]:to-[#31A7AC] group-[.toaster]:text-white group-[.toaster]:border-none",
          loading: "group-[.toaster]:bg-[#31A7AC] group-[.toaster]:text-white group-[.toaster]:border-none",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
