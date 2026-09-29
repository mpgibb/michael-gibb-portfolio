import type { Metadata } from "next";
import "./globals.css";
import { isPublicProduction, productionOrigin } from "@/lib/site";
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
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
