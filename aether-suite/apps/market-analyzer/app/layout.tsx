import type { Metadata } from "next";
import { AetherProvider } from "@aether/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "Market Analyzer",
  description: "Market Analyzer application in the Aether Suite monorepo."
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased"><AetherProvider>{children}</AetherProvider></body>
    </html>
  );
}
