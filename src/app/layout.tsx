import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import LayoutShell from "@/components/layout/LayoutShell";
import QueryProvider from "@/providers/QueryProvider";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lucky Marketplace | Book Premium Event Services",
  description:
    "Book premium decoration services, event setups, and celebration packages. Birthday decorations, wedding setups, candlelight dinners, and more across 500+ cities in India.",
  keywords:
    "event decoration, birthday decoration, wedding decoration, candlelight dinner, party services, event booking",
  openGraph: {
    title: "Lucky Marketplace | Book Premium Event Services",
    description:
      "Your one-stop destination for celebration services. Book premium decorations, events, and celebration packages.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="min-h-screen flex flex-col" style={{ fontFamily: "var(--font-inter)" }}>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: "10px",
              background: "#1E293B",
              color: "#F8FAFC",
              fontSize: "14px",
            },
          }}
        />
        <QueryProvider>
          <LayoutShell>{children}</LayoutShell>
        </QueryProvider>
      </body>
    </html>
  );
}
