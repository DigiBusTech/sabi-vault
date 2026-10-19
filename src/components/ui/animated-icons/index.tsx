"use client";

import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";
import { motion, useAnimation } from "motion/react";
import { cn } from "@/lib/utils";

export interface AnimatedIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

export interface AnimatedIconProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
  strokeWidth?: number;
}

// 1. Arrow Right
export const ArrowRightAnimated = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  ({ className, size = 20, strokeWidth = 2, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const controls = useAnimation();
    const isControlled = useRef(false);

    useImperativeHandle(ref, () => {
      isControlled.current = true;
      return {
        startAnimation: () => controls.start("hover"),
        stopAnimation: () => controls.start("idle"),
      };
    });

    return (
      <div
        className={cn("inline-flex items-center justify-center cursor-pointer", className)}
        onMouseEnter={(e) => {
          if (!isControlled.current) controls.start("hover");
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          if (!isControlled.current) controls.start("idle");
          onMouseLeave?.(e);
        }}
        {...props}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.path
            d="M5 12h14"
            variants={{
              idle: { x: 0 },
              hover: { x: [0, 4, 2, 4], transition: { duration: 0.6, ease: "easeInOut" } },
            }}
            animate={controls}
          />
          <motion.path
            d="m12 5 7 7-7 7"
            variants={{
              idle: { x: 0 },
              hover: { x: [0, 4, 2, 4], transition: { duration: 0.6, ease: "easeInOut" } },
            }}
            animate={controls}
          />
        </svg>
      </div>
    );
  }
);
ArrowRightAnimated.displayName = "ArrowRightAnimated";

// 2. Shield Check
export const ShieldCheckAnimated = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  ({ className, size = 20, strokeWidth = 2, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const controls = useAnimation();
    const isControlled = useRef(false);

    useImperativeHandle(ref, () => {
      isControlled.current = true;
      return {
        startAnimation: () => controls.start("hover"),
        stopAnimation: () => controls.start("idle"),
      };
    });

    return (
      <div
        className={cn("inline-flex items-center justify-center cursor-pointer", className)}
        onMouseEnter={(e) => {
          if (!isControlled.current) controls.start("hover");
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          if (!isControlled.current) controls.start("idle");
          onMouseLeave?.(e);
        }}
        {...props}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.path
            d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
            variants={{
              idle: { scale: 1 },
              hover: { scale: [1, 1.08, 0.98, 1], transition: { duration: 0.5 } },
            }}
            animate={controls}
          />
          <motion.path
            d="m9 12 2 2 4-4"
            variants={{
              idle: { pathLength: 1, opacity: 1 },
              hover: {
                pathLength: [0, 1],
                opacity: [0.4, 1],
                transition: { duration: 0.4, ease: "easeOut" },
              },
            }}
            animate={controls}
          />
        </svg>
      </div>
    );
  }
);
ShieldCheckAnimated.displayName = "ShieldCheckAnimated";

// 3. Fingerprint
export const FingerprintAnimated = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  ({ className, size = 20, strokeWidth = 2, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const controls = useAnimation();
    const isControlled = useRef(false);

    useImperativeHandle(ref, () => {
      isControlled.current = true;
      return {
        startAnimation: () => controls.start("hover"),
        stopAnimation: () => controls.start("idle"),
      };
    });

    return (
      <div
        className={cn("inline-flex items-center justify-center cursor-pointer", className)}
        onMouseEnter={(e) => {
          if (!isControlled.current) controls.start("hover");
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          if (!isControlled.current) controls.start("idle");
          onMouseLeave?.(e);
        }}
        {...props}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.path
            d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"
            variants={{
              idle: { opacity: 1 },
              hover: { opacity: [1, 0.4, 1], transition: { duration: 0.5, delay: 0.1 } },
            }}
            animate={controls}
          />
          <motion.path
            d="M14 13.12c0 2.38 0 6.38-1 8.88"
            variants={{
              idle: { opacity: 1 },
              hover: { opacity: [1, 0.4, 1], transition: { duration: 0.5, delay: 0.2 } },
            }}
            animate={controls}
          />
          <motion.path
            d="M17.29 21.02c.12-.6.43-2.3.5-3.02"
            variants={{
              idle: { opacity: 1 },
              hover: { opacity: [1, 0.4, 1], transition: { duration: 0.5, delay: 0.3 } },
            }}
            animate={controls}
          />
          <motion.path
            d="M2 12a10 10 0 0 1 18-6"
            variants={{
              idle: { scale: 1 },
              hover: { scale: [1, 1.04, 1], transition: { duration: 0.5 } },
            }}
            animate={controls}
          />
          <motion.path
            d="M2 16h.01"
            variants={{
              idle: { scale: 1 },
              hover: { scale: [1, 1.5, 1], transition: { duration: 0.4 } },
            }}
            animate={controls}
          />
          <motion.path
            d="M21.8 16c.2-2 .131-5.354 0-6"
            variants={{
              idle: { opacity: 1 },
              hover: { opacity: [1, 0.5, 1], transition: { duration: 0.5 } },
            }}
            animate={controls}
          />
          <motion.path
            d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"
            variants={{
              idle: { opacity: 1 },
              hover: { opacity: [1, 0.3, 1], transition: { duration: 0.5, delay: 0.15 } },
            }}
            animate={controls}
          />
          <motion.path
            d="M8.65 22c.21-.66.45-1.32.57-2"
            variants={{
              idle: { opacity: 1 },
              hover: { opacity: [1, 0.3, 1], transition: { duration: 0.5, delay: 0.25 } },
            }}
            animate={controls}
          />
          <motion.path
            d="M9 6.8a6 6 0 0 1 9 5.2v2"
            variants={{
              idle: { opacity: 1 },
              hover: { opacity: [1, 0.4, 1], transition: { duration: 0.5, delay: 0.05 } },
            }}
            animate={controls}
          />
        </svg>
      </div>
    );
  }
);
FingerprintAnimated.displayName = "FingerprintAnimated";

// 4. Scan Search
export const ScanSearchAnimated = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  ({ className, size = 20, strokeWidth = 2, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const controls = useAnimation();
    const isControlled = useRef(false);

    useImperativeHandle(ref, () => {
      isControlled.current = true;
      return {
        startAnimation: () => controls.start("hover"),
        stopAnimation: () => controls.start("idle"),
      };
    });

    return (
      <div
        className={cn("inline-flex items-center justify-center cursor-pointer", className)}
        onMouseEnter={(e) => {
          if (!isControlled.current) controls.start("hover");
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          if (!isControlled.current) controls.start("idle");
          onMouseLeave?.(e);
        }}
        {...props}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 7V5a2 2 0 0 1 2-2h2" />
          <path d="M17 3h2a2 2 0 0 1 2 2v2" />
          <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
          <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
          <motion.circle
            cx="12"
            cy="12"
            r="3"
            variants={{
              idle: { scale: 1 },
              hover: { scale: [1, 1.25, 0.95, 1], transition: { duration: 0.5 } },
            }}
            animate={controls}
          />
          <motion.path
            d="m16 16-1.9-1.9"
            variants={{
              idle: { x: 0, y: 0 },
              hover: { x: [0, 2, 0], y: [0, 2, 0], transition: { duration: 0.5 } },
            }}
            animate={controls}
          />
        </svg>
      </div>
    );
  }
);
ScanSearchAnimated.displayName = "ScanSearchAnimated";

// 5. Lock
export const LockAnimated = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  ({ className, size = 20, strokeWidth = 2, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const controls = useAnimation();
    const isControlled = useRef(false);

    useImperativeHandle(ref, () => {
      isControlled.current = true;
      return {
        startAnimation: () => controls.start("hover"),
        stopAnimation: () => controls.start("idle"),
      };
    });

    return (
      <div
        className={cn("inline-flex items-center justify-center cursor-pointer", className)}
        onMouseEnter={(e) => {
          if (!isControlled.current) controls.start("hover");
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          if (!isControlled.current) controls.start("idle");
          onMouseLeave?.(e);
        }}
        {...props}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <motion.path
            d="M7 11V7a5 5 0 0 1 10 0v4"
            variants={{
              idle: { y: 0, originX: 0.7, originY: 1 },
              hover: {
                y: [0, -3, 0],
                rotate: [0, -8, 0],
                transition: { duration: 0.5, ease: "easeInOut" },
              },
            }}
            animate={controls}
          />
        </svg>
      </div>
    );
  }
);
LockAnimated.displayName = "LockAnimated";

// 6. Building 2
export const Building2Animated = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  ({ className, size = 20, strokeWidth = 2, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const controls = useAnimation();
    const isControlled = useRef(false);

    useImperativeHandle(ref, () => {
      isControlled.current = true;
      return {
        startAnimation: () => controls.start("hover"),
        stopAnimation: () => controls.start("idle"),
      };
    });

    return (
      <div
        className={cn("inline-flex items-center justify-center cursor-pointer", className)}
        onMouseEnter={(e) => {
          if (!isControlled.current) controls.start("hover");
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          if (!isControlled.current) controls.start("idle");
          onMouseLeave?.(e);
        }}
        {...props}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.path
            d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"
            variants={{
              idle: { y: 0 },
              hover: { y: [0, -2, 0], transition: { duration: 0.4 } },
            }}
            animate={controls}
          />
          <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
          <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
          <motion.path
            d="M10 6h4"
            variants={{
              idle: { opacity: 1 },
              hover: { opacity: [1, 0.4, 1], transition: { duration: 0.4, delay: 0.1 } },
            }}
            animate={controls}
          />
          <motion.path
            d="M10 10h4"
            variants={{
              idle: { opacity: 1 },
              hover: { opacity: [1, 0.4, 1], transition: { duration: 0.4, delay: 0.2 } },
            }}
            animate={controls}
          />
          <motion.path
            d="M10 14h4"
            variants={{
              idle: { opacity: 1 },
              hover: { opacity: [1, 0.4, 1], transition: { duration: 0.4, delay: 0.3 } },
            }}
            animate={controls}
          />
          <path d="M10 18h4" />
        </svg>
      </div>
    );
  }
);
Building2Animated.displayName = "Building2Animated";

// 7. Graduation Cap
export const GraduationCapAnimated = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  ({ className, size = 20, strokeWidth = 2, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const controls = useAnimation();
    const isControlled = useRef(false);

    useImperativeHandle(ref, () => {
      isControlled.current = true;
      return {
        startAnimation: () => controls.start("hover"),
        stopAnimation: () => controls.start("idle"),
      };
    });

    return (
      <div
        className={cn("inline-flex items-center justify-center cursor-pointer", className)}
        onMouseEnter={(e) => {
          if (!isControlled.current) controls.start("hover");
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          if (!isControlled.current) controls.start("idle");
          onMouseLeave?.(e);
        }}
        {...props}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.path
            d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"
            variants={{
              idle: { rotate: 0 },
              hover: { rotate: [0, -5, 5, 0], transition: { duration: 0.5 } },
            }}
            animate={controls}
          />
          <path d="M22 10v6" />
          <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
        </svg>
      </div>
    );
  }
);
GraduationCapAnimated.displayName = "GraduationCapAnimated";

// 8. Briefcase
export const BriefcaseAnimated = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  ({ className, size = 20, strokeWidth = 2, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const controls = useAnimation();
    const isControlled = useRef(false);

    useImperativeHandle(ref, () => {
      isControlled.current = true;
      return {
        startAnimation: () => controls.start("hover"),
        stopAnimation: () => controls.start("idle"),
      };
    });

    return (
      <div
        className={cn("inline-flex items-center justify-center cursor-pointer", className)}
        onMouseEnter={(e) => {
          if (!isControlled.current) controls.start("hover");
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          if (!isControlled.current) controls.start("idle");
          onMouseLeave?.(e);
        }}
        {...props}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
          <motion.path
            d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"
            variants={{
              idle: { y: 0 },
              hover: { y: [0, -3, 0], transition: { duration: 0.4 } },
            }}
            animate={controls}
          />
        </svg>
      </div>
    );
  }
);
BriefcaseAnimated.displayName = "BriefcaseAnimated";

// 9. Award
export const AwardAnimated = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  ({ className, size = 20, strokeWidth = 2, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const controls = useAnimation();
    const isControlled = useRef(false);

    useImperativeHandle(ref, () => {
      isControlled.current = true;
      return {
        startAnimation: () => controls.start("hover"),
        stopAnimation: () => controls.start("idle"),
      };
    });

    return (
      <div
        className={cn("inline-flex items-center justify-center cursor-pointer", className)}
        onMouseEnter={(e) => {
          if (!isControlled.current) controls.start("hover");
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          if (!isControlled.current) controls.start("idle");
          onMouseLeave?.(e);
        }}
        {...props}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.circle
            cx="12"
            cy="8"
            r="6"
            variants={{
              idle: { scale: 1 },
              hover: { scale: [1, 1.15, 0.95, 1], transition: { duration: 0.5 } },
            }}
            animate={controls}
          />
          <motion.path
            d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"
            variants={{
              idle: { y: 0 },
              hover: { y: [0, 2, 0], transition: { duration: 0.4 } },
            }}
            animate={controls}
          />
        </svg>
      </div>
    );
  }
);
AwardAnimated.displayName = "AwardAnimated";

// 10. Wallet
export const WalletAnimated = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  ({ className, size = 20, strokeWidth = 2, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const controls = useAnimation();
    const isControlled = useRef(false);

    useImperativeHandle(ref, () => {
      isControlled.current = true;
      return {
        startAnimation: () => controls.start("hover"),
        stopAnimation: () => controls.start("idle"),
      };
    });

    return (
      <div
        className={cn("inline-flex items-center justify-center cursor-pointer", className)}
        onMouseEnter={(e) => {
          if (!isControlled.current) controls.start("hover");
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          if (!isControlled.current) controls.start("idle");
          onMouseLeave?.(e);
        }}
        {...props}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
          <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
          <motion.circle
            cx="18"
            cy="14"
            r="1"
            variants={{
              idle: { scale: 1 },
              hover: { scale: [1, 1.8, 1], transition: { duration: 0.4 } },
            }}
            animate={controls}
          />
        </svg>
      </div>
    );
  }
);
WalletAnimated.displayName = "WalletAnimated";

// 11. Globe 2
export const Globe2Animated = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  ({ className, size = 20, strokeWidth = 2, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const controls = useAnimation();
    const isControlled = useRef(false);

    useImperativeHandle(ref, () => {
      isControlled.current = true;
      return {
        startAnimation: () => controls.start("hover"),
        stopAnimation: () => controls.start("idle"),
      };
    });

    return (
      <div
        className={cn("inline-flex items-center justify-center cursor-pointer", className)}
        onMouseEnter={(e) => {
          if (!isControlled.current) controls.start("hover");
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          if (!isControlled.current) controls.start("idle");
          onMouseLeave?.(e);
        }}
        {...props}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <motion.path
            d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"
            variants={{
              idle: { rotateY: 0 },
              hover: { rotateY: [0, 180, 360], transition: { duration: 1.2, ease: "linear" } },
            }}
            animate={controls}
          />
          <path d="M2 12h20" />
        </svg>
      </div>
    );
  }
);
Globe2Animated.displayName = "Globe2Animated";

// 12. Sparkles
export const SparklesAnimated = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  ({ className, size = 20, strokeWidth = 2, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const controls = useAnimation();
    const isControlled = useRef(false);

    useImperativeHandle(ref, () => {
      isControlled.current = true;
      return {
        startAnimation: () => controls.start("hover"),
        stopAnimation: () => controls.start("idle"),
      };
    });

    return (
      <div
        className={cn("inline-flex items-center justify-center cursor-pointer", className)}
        onMouseEnter={(e) => {
          if (!isControlled.current) controls.start("hover");
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          if (!isControlled.current) controls.start("idle");
          onMouseLeave?.(e);
        }}
        {...props}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.path
            d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"
            variants={{
              idle: { rotate: 0, scale: 1 },
              hover: {
                rotate: [0, 45, 0],
                scale: [1, 1.2, 1],
                transition: { duration: 0.6, ease: "easeInOut" },
              },
            }}
            animate={controls}
          />
          <motion.path
            d="M20 3v4"
            variants={{
              idle: { opacity: 1 },
              hover: { opacity: [1, 0.2, 1], transition: { duration: 0.4 } },
            }}
            animate={controls}
          />
          <motion.path
            d="M22 5h-4"
            variants={{
              idle: { opacity: 1 },
              hover: { opacity: [1, 0.2, 1], transition: { duration: 0.4 } },
            }}
            animate={controls}
          />
        </svg>
      </div>
    );
  }
);
SparklesAnimated.displayName = "SparklesAnimated";

// 13. Cpu
export const CpuAnimated = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  ({ className, size = 20, strokeWidth = 2, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const controls = useAnimation();
    const isControlled = useRef(false);

    useImperativeHandle(ref, () => {
      isControlled.current = true;
      return {
        startAnimation: () => controls.start("hover"),
        stopAnimation: () => controls.start("idle"),
      };
    });

    return (
      <div
        className={cn("inline-flex items-center justify-center cursor-pointer", className)}
        onMouseEnter={(e) => {
          if (!isControlled.current) controls.start("hover");
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          if (!isControlled.current) controls.start("idle");
          onMouseLeave?.(e);
        }}
        {...props}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="16" height="16" x="4" y="4" rx="2" />
          <motion.rect
            width="6"
            height="6"
            x="9"
            y="9"
            rx="1"
            variants={{
              idle: { scale: 1 },
              hover: { scale: [1, 1.3, 1], transition: { duration: 0.5 } },
            }}
            animate={controls}
          />
          <path d="M15 2v2" />
          <path d="M15 20v2" />
          <path d="M2 15h2" />
          <path d="M2 9h2" />
          <path d="M20 15h2" />
          <path d="M20 9h2" />
          <path d="M9 2v2" />
          <path d="M9 20v2" />
        </svg>
      </div>
    );
  }
);
CpuAnimated.displayName = "CpuAnimated";

// 14. Check Circle 2
export const CheckCircle2Animated = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  ({ className, size = 20, strokeWidth = 2, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const controls = useAnimation();
    const isControlled = useRef(false);

    useImperativeHandle(ref, () => {
      isControlled.current = true;
      return {
        startAnimation: () => controls.start("hover"),
        stopAnimation: () => controls.start("idle"),
      };
    });

    return (
      <div
        className={cn("inline-flex items-center justify-center cursor-pointer", className)}
        onMouseEnter={(e) => {
          if (!isControlled.current) controls.start("hover");
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          if (!isControlled.current) controls.start("idle");
          onMouseLeave?.(e);
        }}
        {...props}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <motion.path
            d="m9 12 2 2 4-4"
            variants={{
              idle: { pathLength: 1, scale: 1 },
              hover: {
                pathLength: [0, 1],
                scale: [0.8, 1.15, 1],
                transition: { duration: 0.45, ease: "easeOut" },
              },
            }}
            animate={controls}
          />
        </svg>
      </div>
    );
  }
);
CheckCircle2Animated.displayName = "CheckCircle2Animated";

// 15. File Check
export const FileCheckAnimated = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  ({ className, size = 20, strokeWidth = 2, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const controls = useAnimation();
    const isControlled = useRef(false);

    useImperativeHandle(ref, () => {
      isControlled.current = true;
      return {
        startAnimation: () => controls.start("hover"),
        stopAnimation: () => controls.start("idle"),
      };
    });

    return (
      <div
        className={cn("inline-flex items-center justify-center cursor-pointer", className)}
        onMouseEnter={(e) => {
          if (!isControlled.current) controls.start("hover");
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          if (!isControlled.current) controls.start("idle");
          onMouseLeave?.(e);
        }}
        {...props}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
          <motion.path
            d="m9 15 2 2 4-4"
            variants={{
              idle: { pathLength: 1 },
              hover: { pathLength: [0, 1], transition: { duration: 0.4 } },
            }}
            animate={controls}
          />
        </svg>
      </div>
    );
  }
);
FileCheckAnimated.displayName = "FileCheckAnimated";

// 16. Play
export const PlayAnimated = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  ({ className, size = 20, strokeWidth = 2, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const controls = useAnimation();
    const isControlled = useRef(false);

    useImperativeHandle(ref, () => {
      isControlled.current = true;
      return {
        startAnimation: () => controls.start("hover"),
        stopAnimation: () => controls.start("idle"),
      };
    });

    return (
      <div
        className={cn("inline-flex items-center justify-center cursor-pointer", className)}
        onMouseEnter={(e) => {
          if (!isControlled.current) controls.start("hover");
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          if (!isControlled.current) controls.start("idle");
          onMouseLeave?.(e);
        }}
        {...props}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.polygon
            points="6 3 20 12 6 21 6 3"
            variants={{
              idle: { scale: 1 },
              hover: { scale: [1, 1.25, 0.95, 1], transition: { duration: 0.4 } },
            }}
            animate={controls}
          />
        </svg>
      </div>
    );
  }
);
PlayAnimated.displayName = "PlayAnimated";

// 17. Plus
export const PlusAnimated = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  ({ className, size = 20, strokeWidth = 2, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const controls = useAnimation();
    const isControlled = useRef(false);

    useImperativeHandle(ref, () => {
      isControlled.current = true;
      return {
        startAnimation: () => controls.start("hover"),
        stopAnimation: () => controls.start("idle"),
      };
    });

    return (
      <div
        className={cn("inline-flex items-center justify-center cursor-pointer", className)}
        onMouseEnter={(e) => {
          if (!isControlled.current) controls.start("hover");
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          if (!isControlled.current) controls.start("idle");
          onMouseLeave?.(e);
        }}
        {...props}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.path
            d="M5 12h14"
            variants={{
              idle: { rotate: 0 },
              hover: { rotate: [0, 90, 0], transition: { duration: 0.5 } },
            }}
            animate={controls}
          />
          <motion.path
            d="M12 5v14"
            variants={{
              idle: { rotate: 0 },
              hover: { rotate: [0, 90, 0], transition: { duration: 0.5 } },
            }}
            animate={controls}
          />
        </svg>
      </div>
    );
  }
);
PlusAnimated.displayName = "PlusAnimated";

// 18. Landmark
export const LandmarkAnimated = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  ({ className, size = 20, strokeWidth = 2, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const controls = useAnimation();
    const isControlled = useRef(false);

    useImperativeHandle(ref, () => {
      isControlled.current = true;
      return {
        startAnimation: () => controls.start("hover"),
        stopAnimation: () => controls.start("idle"),
      };
    });

    return (
      <div
        className={cn("inline-flex items-center justify-center cursor-pointer", className)}
        onMouseEnter={(e) => {
          if (!isControlled.current) controls.start("hover");
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          if (!isControlled.current) controls.start("idle");
          onMouseLeave?.(e);
        }}
        {...props}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" x2="21" y1="22" y2="22" />
          <line x1="6" x2="6" y1="18" y2="11" />
          <line x1="10" x2="10" y1="18" y2="11" />
          <line x1="14" x2="14" y1="18" y2="11" />
          <line x1="18" x2="18" y1="18" y2="11" />
          <motion.polygon
            points="12 2 20 7 4 7"
            variants={{
              idle: { y: 0 },
              hover: { y: [0, -3, 0], transition: { duration: 0.4 } },
            }}
            animate={controls}
          />
        </svg>
      </div>
    );
  }
);
LandmarkAnimated.displayName = "LandmarkAnimated";

