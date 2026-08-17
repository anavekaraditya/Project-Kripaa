import type { Metadata } from "next";
import { Albert_Sans, Literata } from "next/font/google";
import "./globals.css";

const display = Literata({ subsets: ["latin"], weight: "variable", style: ["normal", "italic"], variable: "--font-display", display: "swap" });
const sans = Albert_Sans({ subsets: ["latin"], weight: "variable", variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: "Project Kripa — Return to what is here",
  description: "A tactile ring for intentional movement, grounding and meditation.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${display.variable} ${sans.variable}`}><body>{children}</body></html>;
}
