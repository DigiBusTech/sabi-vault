---
name: liquid-glass-js
description: Apple Liquid Glass UI effects library (dashersw/liquid-glass-js) for WebGL refraction, optical lens distortion, nested glass hierarchy, rim lighting, specular sweeps, and modern liquid glass CSS/canvas integration across UI components.
---

# Liquid Glass JS Skill (`dashersw/liquid-glass-js`)

This skill guides the implementation of Apple Liquid Glass aesthetics inspired by `dashersw/liquid-glass-js`, delivering hyper-realistic optical refraction, multi-layer lens depth, nested glass containers, specular highlights, and chromatic edge effects.

## Core Architectural Concepts

1. **Three Geometry Types**:
   - `rounded`: Rounded rectangle panels with configurable border-radius.
   - `pill`: Capsule shapes with pill-geometry border-radius.
   - `circle`: Circular buttons, floating action triggers, and badges.

2. **The 5 Optical Layers of Liquid Glass**:
   - **Backdrop Blur & Saturation**: `backdrop-filter: blur(20px) saturate(180%)` to soften backgrounds without washing out vibrancy.
   - **Optical Refraction Distortion**: Real-time lens displacement (via WebGL fragment shader or SVG `feDisplacementMap` driven by `feTurbulence`) that warps and bends the background around the perimeter.
   - **Concentric Rim Lighting**: Hairline borders catching ambient light, with a brighter top-left edge highlight (`rgba(255, 255, 255, 0.4)`) and subtle bottom shade.
   - **Layered Specular Depth**: Inset highlights (`inset 0 1px 1px 0 rgba(255, 255, 255, 0.6)`) paired with ambient drop shadows (`0 8px 32px -4px rgba(15, 23, 42, 0.12)`).
   - **Nested Glass Sampling**: Child elements inside glass containers sample and refract with deeper optical density.

## Reusable React / Tailwind Implementation Patterns

### 1. Liquid Glass Container (`LiquidGlassCard`)
```tsx
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface LiquidGlassProps {
  children: ReactNode;
  className?: string;
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
}: LiquidGlassProps) {
  const shapeClass =
    variant === "pill"
      ? "rounded-full"
      : variant === "circle"
      ? "rounded-full aspect-square flex items-center justify-center"
      : "rounded-3xl";

  const intensityClass = {
    subtle: "bg-white/40 backdrop-blur-md border-white/50 shadow-glass-subtle",
    medium: "bg-white/60 backdrop-blur-xl border-white/70 shadow-glass-medium",
    deep: "bg-white/75 backdrop-blur-2xl border-white/80 shadow-glass-deep",
  }[intensity];

  return (
    <div
      className={cn(
        "relative overflow-hidden border transition-all duration-300",
        "before:absolute before:inset-0 before:pointer-events-none before:bg-gradient-to-b before:from-white/40 before:to-transparent before:opacity-80",
        interactive && "hover:bg-white/70 hover:shadow-glass-hover hover:-translate-y-0.5",
        shapeClass,
        intensityClass,
        className
      )}
    >
      {children}
    </div>
  );
}
```

### 2. SVG Refraction Displacement Filter
For authentic liquid glass refraction without heavy canvas overhead, use an ambient SVG displacement filter:
```tsx
export function LiquidGlassFilter() {
  return (
    <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
      <defs>
        <filter id="liquid-glass-refract" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.015 0.02"
            numOctaves="2"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="10"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}
```

### 3. Reduced Motion & Reduced Transparency Fallbacks
Always respect WCAG guidelines:
```css
@media (prefers-reduced-transparency: reduce) {
  .liquid-glass {
    background: #ffffff !important;
    backdrop-filter: none !important;
  }
}
@media (prefers-reduced-motion: reduce) {
  .liquid-glass-animated {
    animation: none !important;
    transform: none !important;
  }
}
```

