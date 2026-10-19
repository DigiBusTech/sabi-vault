"use client";

import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface LiquidGlassProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "rounded" | "pill" | "circle";
  intensity?: "subtle" | "medium" | "deep";
  interactive?: boolean;
}

export function LiquidGlassCard({
  children,
  className,
  variant = "rounded",
  intensity = "medium",
  interactive = true,
  ...props
}: LiquidGlassProps) {
  const shapeClass =
    variant === "pill"
      ? "liquid-glass-pill"
      : variant === "circle"
      ? "liquid-glass-circle"
      : "liquid-glass-card rounded-3xl";

  const intensityClass = {
    subtle: "backdrop-blur-md bg-white/55",
    medium: "backdrop-blur-xl bg-white/72",
    deep: "backdrop-blur-2xl bg-white/85",
  }[intensity];

  return (
    <div
      className={cn(
        shapeClass,
        intensityClass,
        !interactive && "hover:transform-none hover:shadow-none hover:border-white/85",
        className
      )}
      {...props}
    >
      {/* Specular Edge Refraction Sweep */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/60 via-transparent to-transparent opacity-75"
        aria-hidden="true"
      />
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
}

export function LiquidGlassFilter() {
  return (
    <svg className="absolute w-0 h-0 pointer-events-none opacity-0" aria-hidden="true">
      <defs>
        <filter id="liquid-glass-refract" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012 0.018"
            numOctaves="2"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="8"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}

