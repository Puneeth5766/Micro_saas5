import type { PropsWithChildren } from "react";
import { Inter, JetBrains_Mono } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

type UIFontProviderProps = PropsWithChildren<{
  theme?: "light" | "dark";
}>;

export function UIFontProvider({ children, theme = "light" }: UIFontProviderProps) {
  return (
    <div className={`${inter.variable} ${jetbrainsMono.variable}`} data-theme={theme}>
      {children}
    </div>
  );
}
