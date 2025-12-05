import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Lexend } from 'next/font/google';
import WhatsAppButton from "@/components/ui/WhatsAppButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
});

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return 'http://localhost:3000'
}

const baseUrl = getBaseUrl()

export const metadata: Metadata = {
  title: "VisitMakkah – Voyage et accompagnement Omra à La Mecque | Guide pour pèlerins",
  description: "VisitMakkah – Voyage et accompagnement Omra à La Mecque | Guide pour pèlerins",
  icons: {
    icon: "/images/makkah_logo.png",
    shortcut: "/images/makkah_logo.png",
    apple: "/images/makkah_logo.png",
  },
  openGraph: {
    title: "VisitMakkah – Voyage et accompagnement Omra à La Mecque | Guide pour pèlerins",
    description: "VisitMakkah – Voyage et accompagnement Omra à La Mecque | Guide pour pèlerins",
    images: [
      {
        url: `${baseUrl}/images/makkah_logo.png`,
        width: 1200,
        height: 630,
        alt: "VisitMakkah Logo",
      },
    ],
    type: "website",
    siteName: "VisitMakkah",
  },
  twitter: {
    card: "summary_large_image",
    title: "VisitMakkah – Voyage et accompagnement Omra à La Mecque | Guide pour pèlerins",
    description: "VisitMakkah – Voyage et accompagnement Omra à La Mecque | Guide pour pèlerins",
    images: [`${baseUrl}/images/makkah_logo.png`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth overflow-x-hidden">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${lexend.variable} antialiased overflow-x-hidden`}
      >
        {children}
        <WhatsAppButton />
      </body>
    </html>
  );
}
