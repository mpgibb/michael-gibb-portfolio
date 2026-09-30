import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./experience.css";
import { ExperienceShell } from "@/components/experience/shell";
import { Header, Footer } from "@/components/portfolio";
import { isPublicProduction, productionOrigin } from "@/lib/site";
const mastheadSerif = localFont({
  src: "./fonts/source-serif-4-500-masthead.woff2", weight: "500", style: "normal",
  display: "swap", variable: "--font-masthead-name", fallback: ["Georgia", "serif"],
  adjustFontFallback: "Times New Roman",
});
const mastheadSans = localFont({
  src: "./fonts/source-sans-3-500-masthead.woff2", weight: "500", style: "normal",
  display: "swap", variable: "--font-masthead-tagline", fallback: ["Arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: {
    default: "Michael P. Gibb, Ph.D. | Commercial Analytics & AI",
    template: "%s | Michael P. Gibb, Ph.D.",
  },
  description:
    "Analytics and AI leadership for growth and better business decisions. Marketing effectiveness, revenue forecasting, customer value and operational planning.",
  metadataBase: new URL(productionOrigin),
  robots: { index: isPublicProduction, follow: isPublicProduction },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${mastheadSerif.variable} ${mastheadSans.variable}`}>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Header />
        {children}
        <Footer />
        <ExperienceShell />
      </body>
    </html>
  );
}
