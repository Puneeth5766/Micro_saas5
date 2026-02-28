"use client";

import type { PropsWithChildren } from "react";
import { Toaster } from "../components/feedback/Toast";
import { FontProvider } from "./FontProvider";
import { ThemeProvider } from "./ThemeProvider";

function ToasterProvider({ children }: PropsWithChildren) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}

export function AetherProvider({ children }: PropsWithChildren) {
  return (
    <FontProvider>
      <ThemeProvider>
        <ToasterProvider>{children}</ToasterProvider>
      </ThemeProvider>
    </FontProvider>
  );
}
