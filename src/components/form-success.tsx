"use client";

import { motion, useReducedMotion } from "framer-motion";

export function FormSuccess({ message }: { message: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center gap-5 py-10 text-center"
    >
      <motion.span
        initial={reduce ? { opacity: 0 } : { scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.05, type: "spring", stiffness: 260, damping: 18 }}
        className="relative flex h-14 w-14 items-center justify-center rounded-full border border-accent/40 bg-accent/10"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-accent/20 [animation-iteration-count:2]" />
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
          className="relative"
        >
          <motion.path
            d="M5 12.5 10 17.5 19 6.5"
            stroke="var(--color-accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.25, duration: 0.45, ease: "easeOut" }}
          />
        </svg>
      </motion.span>
      <p className="max-w-sm text-base text-foreground text-balance">{message}</p>
    </motion.div>
  );
}
