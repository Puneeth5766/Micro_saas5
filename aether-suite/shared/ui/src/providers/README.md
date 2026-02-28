# AetherProvider Usage (Next.js App Router)

Use `AetherProvider` once in each app's root `app/layout.tsx`.

```tsx
import type { Metadata } from "next";
import { AetherProvider } from "@aether/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "Your App",
  description: "Your app description"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <AetherProvider>{children}</AetherProvider>
      </body>
    </html>
  );
}
```

This wraps the app with:

1. `FontProvider` (Inter + JetBrains Mono variable fonts)
2. `ThemeProvider` (`data-theme` management + localStorage persistence)
3. `ToasterProvider` (global toast outlet)
