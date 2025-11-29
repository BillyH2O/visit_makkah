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

export const metadata: Metadata = {
  title: "VisitMakkah – Voyage et accompagnement Omra à La Mecque | Guide pour pèlerins",
  description: "VisitMakkah – Voyage et accompagnement Omra à La Mecque | Guide pour pèlerins",
  icons: {
    icon: "/images/makkah_logo.png",
    shortcut: "/images/makkah_logo.png",
    apple: "/images/makkah_logo.png",
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
