"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
}

function useReducedMotionPreference() {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setShouldReduceMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  return shouldReduceMotion;
}

export function Reveal({
  children,
  className,
  delay = 0,
  distance = 20,
}: RevealProps) {
  const shouldReduceMotion = useReducedMotionPreference();
  const visible = { opacity: 1, y: 0 };

  return (
    <motion.div
      data-reveal="true"
      initial={{ opacity: 0, y: distance }}
      animate={shouldReduceMotion ? visible : undefined}
      whileInView={visible}
      viewport={{ once: true, amount: 0.18 }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : {
              duration: 0.55,
              delay,
              ease: [0.22, 1, 0.36, 1],
            }
      }
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
