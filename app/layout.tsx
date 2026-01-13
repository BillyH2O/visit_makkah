import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Lexend } from 'next/font/google';
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import MetaTags from "@/components/layout/MetaTags";

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
  metadataBase: new URL(baseUrl),
  title: {
    default: "VisitMakkah – Voyage et accompagnement Omra à La Mecque | Guide pour pèlerins",
    template: "%s | VisitMakkah",
  },
  description: "VisitMakkah propose des services complets pour votre Omra à La Mecque : formules de voyage, accompagnement, services de transport, visa et sadaqa. Votre voyage spirituel en toute sérénité.",
  keywords: [
    "Omra",
    "La Mecque",
    "Makkah",
    "pèlerinage",
    "voyage spirituel",
    "visa Omra",
    "accompagnement Omra",
    "transport La Mecque",
    "sadaqa",
    "Omra Badal",
    "voyage Arabie Saoudite",
    "pèlerinage musulman",
    "Hajj",
    "visa Arabie Saoudite",
  ],
  authors: [{ name: "VisitMakkah" }],
  creator: "VisitMakkah",
  publisher: "VisitMakkah",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/images/makkah_logo.png", sizes: "any" },
    ],
    shortcut: "/images/makkah_logo.png",
    apple: [
      { url: "/images/makkah_logo.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: baseUrl,
    siteName: "VisitMakkah",
    title: "VisitMakkah – Voyage et accompagnement Omra à La Mecque | Guide pour pèlerins",
    description: "VisitMakkah propose des services complets pour votre Omra à La Mecque : formules de voyage, accompagnement, services de transport, visa et sadaqa. Votre voyage spirituel en toute sérénité.",
    images: [
      {
        url: `${baseUrl}/images/makkah_logo.png`,
        width: 1200,
        height: 630,
        alt: "VisitMakkah – Voyage et accompagnement Omra à La Mecque",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VisitMakkah – Voyage et accompagnement Omra à La Mecque",
    description: "Votre voyage spirituel en toute sérénité. Services complets pour votre Omra : formules, accompagnement, transport, visa et sadaqa.",
    images: [`${baseUrl}/images/makkah_logo.png`],
    creator: "@visitmakkah",
  },
  alternates: {
    canonical: baseUrl,
  },
  category: "Travel",
  classification: "Travel & Tourism",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#000000" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VisitMakkah",
  },
  other: {
    "contact:email": "visitmakkah@visit-makkah.fr",
    "contact:phone_number": "+966 54 731 9133",
    "geo.region": "SA-02",
    "geo.placename": "Makkah",
    "geo.position": "21.3891;39.8579",
    "ICBM": "21.3891, 39.8579",
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#000000",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth overflow-x-hidden">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${lexend.variable} antialiased overflow-x-hidden`}
      >
        <MetaTags />
        {children}
        <WhatsAppButton />
      </body>
    </html>
  );
}
