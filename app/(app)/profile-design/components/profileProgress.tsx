"use client"

import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Camera } from "lucide-react"

interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  imageUrl: string
  size?: number
  strokeWidth?: number
}

function ProfileProgress({
  className,
  value = 0,
  imageUrl,
  size = 112,
  strokeWidth = 10,
  ...props
}: CircularProgressProps) {
  const [profileImageHovered, setProfileImageHovered] = React.useState(false)
  const innerSize = Math.max(size - strokeWidth * 2, 0)
  const clampedValue = Math.min(Math.max(value, 0), 100)
  const progressAngle = (clampedValue / 100) * 360
  const gradientBackground =
    "conic-gradient(from 35deg at 50% 50%, #31A7AC 0deg, #6A89BE 144deg, #85AAB7 216deg, #FA6E80 360deg)"
  const pillTop = size - 20
  const pillCenter = size / 2

  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      {...props}

    >
      <div className="absolute inset-0 rounded-full border-[3px] border-white bg-[#F3F3F3]" />
      <div
        className="absolute inset-0 rounded-full border-[3px] border-white"
        style={{
          background: gradientBackground,
          maskImage: `conic-gradient(transparent 0deg ${360 - progressAngle}deg, #000 ${360 - progressAngle}deg 360deg)`,
          WebkitMaskImage: `conic-gradient(transparent 0deg ${360 - progressAngle}deg, #000 ${360 - progressAngle}deg 360deg)`,
        }}
      />
      <div
        className="relative z-10 flex items-center justify-center rounded-full bg-white overflow-hidden"
        style={{ width: innerSize, height: innerSize, border: "3px solid #FFFFFF" }}
        onMouseEnter={() => setProfileImageHovered(true)}
        onMouseLeave={() => setProfileImageHovered(false)}
      >
        {imageUrl?.length > 0 ? (
          <Image
            src={imageUrl}
            alt="Profile"
            fill
            className="rounded-full object-cover"
          />
        ) : (
          <span className="text-sm font-semibold text-gray-500">{clampedValue}%</span>
        )}
        <div
          className={`absolute inset-1 flex items-center justify-center rounded-full transition-opacity ${profileImageHovered ? "bg-black/60 text-white" : "bg-transparent text-transparent"}`}
        ><Camera className="h-6 w-6" />
        </div>
      </div>

      <div
        className="absolute z-50"
        style={{ top: pillTop, left: pillCenter, transform: "translate(-50%, 0)" }}
      >
        <span className="inline-flex h-[25px] min-w-[41px] items-center justify-center rounded-[10px] bg-white px-4 py-1 text-[10px] font-[500] text-[#FA6E80] shadow">
          {clampedValue}%
        </span>
      </div>
    </div>
  )
}

export { ProfileProgress }
