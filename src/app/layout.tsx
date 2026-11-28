import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/app/globals.css";
import GrainientBackground from "@/components/GrainientBackground";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Golden Api",
  description: "A modern collection of financial and precious metals calculators.",
  keywords: ["calculators", "converters", "gold price", "currency converter", "financial tools"],
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="relative min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider>
          <GrainientBackground />
          <div className="relative z-10 min-h-screen">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
