"use client";

import React from "react";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageTransition({ children, className = "" }: PageTransitionProps) {
  return (
    <div className={`relative w-full page-transition-slide ${className}`}>
      {/* Micro top accent glow for slideshow indicator */}
      <div className="absolute -top-3 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent slide-glow-bar pointer-events-none" />
      {children}
    </div>
  );
}
