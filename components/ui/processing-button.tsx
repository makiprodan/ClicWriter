"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ProcessingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isProcessing?: boolean;
  processingText?: string;
  children: React.ReactNode;
  variant?: "default" | "shimmer" | "shiny";
}

export function ProcessingButton({
  isProcessing = false,
  processingText = "Processando...",
  children,
  variant = "default",
  className,
  disabled,
  ...props
}: ProcessingButtonProps) {
  const isDisabled = disabled || isProcessing;

  if (variant === "shimmer") {
    return (
      <button
        className={cn(
          "inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50",
          isDisabled && "opacity-50 cursor-not-allowed",
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {isProcessing ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{processingText}</span>
          </div>
        ) : (
          children
        )}
      </button>
    );
  }

  if (variant === "shiny") {
    return (
      <button
        className={cn(
          "inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50",
          "relative overflow-hidden",
          isDisabled && "opacity-50 cursor-not-allowed",
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shine" />
        {isProcessing ? (
          <div className="flex items-center gap-2 relative z-10">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{processingText}</span>
          </div>
        ) : (
          <span className="relative z-10">{children}</span>
        )}
      </button>
    );
  }

  // Default variant
  return (
    <button
      className={cn(
        "inline-flex h-12 items-center justify-center rounded-md bg-primary px-6 font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        isDisabled && "opacity-50 cursor-not-allowed",
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {isProcessing ? (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{processingText}</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}

// CSS para as animações (adicionar ao globals.css)
export const processingButtonStyles = `
@keyframes shimmer {
  from {
    background-position: 0 0;
  }
  to {
    background-position: -200% 0;
  }
}

@keyframes shine {
  0% {
    transform: translateX(-100%) skewX(-12deg);
  }
  100% {
    transform: translateX(200%) skewX(-12deg);
  }
}

.animate-shimmer {
  animation: shimmer 2s linear infinite;
}

.animate-shine {
  animation: shine 2s ease-in-out infinite;
}
`;