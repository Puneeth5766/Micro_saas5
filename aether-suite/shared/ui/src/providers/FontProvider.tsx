"use client";

import { Inter, JetBrains_Mono } from "next/font/google";
import { useEffect, type PropsWithChildren } from "react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap"
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap"
});

export function FontProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add(inter.variable, jetbrainsMono.variable);

    return () => {
      root.classList.remove(inter.variable, jetbrainsMono.variable);
    };
  }, []);

  return <>{children}</>;
}
