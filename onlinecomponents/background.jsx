"use client"

import { motion } from "framer-motion"
import type React from "react"
import { cn } from "@/lib/utils"

export interface BackgroundGradientProps {
  className?: string
  children?: React.ReactNode
}

export const BackgroundGradient = ({ className, children }: BackgroundGradientProps) => {
  return (
    <div className={cn("fixed inset-0 overflow-hidden bg-neutral-950", className)}>
      {/* Base dark gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950" />

      {/* Animated gradient blobs */}
      <motion.div
        className="absolute rounded-full blur-[120px]"
        style={{
          width: "min(50vw, 50vh)",
          height: "min(50vw, 50vh)",
          background: "radial-gradient(circle, rgba(0, 204, 177, 0.4) 0%, transparent 70%)",
        }}
        animate={{
          x: ["0%", "30%", "10%", "0%"],
          y: ["0%", "20%", "40%", "0%"],
        }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        initial={{ x: "10%", y: "10%" }}
      />

      <motion.div
        className="absolute rounded-full blur-[120px]"
        style={{
          width: "min(60vw, 60vh)",
          height: "min(60vw, 60vh)",
          background: "radial-gradient(circle, rgba(123, 97, 255, 0.35) 0%, transparent 70%)",
        }}
        animate={{
          x: ["60%", "40%", "70%", "60%"],
          y: ["10%", "30%", "5%", "10%"],
        }}
        transition={{
          duration: 25,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        initial={{ x: "60%", y: "10%" }}
      />

      <motion.div
        className="absolute rounded-full blur-[100px]"
        style={{
          width: "min(45vw, 45vh)",
          height: "min(45vw, 45vh)",
          background: "radial-gradient(circle, rgba(28, 160, 251, 0.35) 0%, transparent 70%)",
        }}
        animate={{
          x: ["20%", "50%", "30%", "20%"],
          y: ["60%", "40%", "70%", "60%"],
        }}
        transition={{
          duration: 18,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        initial={{ x: "20%", y: "60%" }}
      />

      <motion.div
        className="absolute rounded-full blur-[100px]"
        style={{
          width: "min(55vw, 55vh)",
          height: "min(55vw, 55vh)",
          background: "radial-gradient(circle, rgba(255, 73, 219, 0.3) 0%, transparent 70%)",
        }}
        animate={{
          x: ["70%", "50%", "80%", "70%"],
          y: ["50%", "70%", "40%", "50%"],
        }}
        transition={{
          duration: 22,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        initial={{ x: "70%", y: "50%" }}
      />

      <motion.div
        className="absolute rounded-full blur-[80px]"
        style={{
          width: "min(40vw, 40vh)",
          height: "min(40vw, 40vh)",
          background: "radial-gradient(circle, rgba(153, 69, 255, 0.3) 0%, transparent 70%)",
        }}
        animate={{
          x: ["40%", "60%", "30%", "40%"],
          y: ["30%", "50%", "20%", "30%"],
        }}
        transition={{
          duration: 15,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        initial={{ x: "40%", y: "30%" }}
      />

      {/* Subtle noise overlay for texture */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content layer */}
      {children && <div className="relative z-10 h-full w-full">{children}</div>}
    </div>
  )
}

export default function BackgroundGradientDemo() {
  return <BackgroundGradient />
}

export type { BackgroundGradientProps as BackgroundGradientPropsType }