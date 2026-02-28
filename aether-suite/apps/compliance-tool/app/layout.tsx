import type { Metadata } from "next";
import { AetherProvider } from "@aether/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "Compliance Tool",
  description: "Compliance Tool application in the Aether Suite monorepo."
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
