import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Lexend } from 'next/font/google';
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import MetaTags from "@/components/layout/MetaTags";
import { CookieBanner } from "@/components/legal/CookieBanner";

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
    default: "Visit Makkah  | Agence Hajj et Omra Paris France",
    template: "%s | VisitMakkah",
  },
  description: "VisitMakkah est une agence spécialisée dans l'organisation du Hajj et de la Omra depuis Paris et toute la France. Nous proposons des services personnalisés, des guides expérimentés, des transferts de qualité et un accompagnement complet pour un pèlerinage serein à La Mecque.",
  keywords: [
    "VisitMakkah",
    "hajj",
    "omra",
    "Makkah",
    "makka",
    "agence Hajj Paris",
    "agence Omra Paris",
    "Hajj France",
    "Omra France",
    "Omra depuis Paris",
    "pèlerinage La Mecque Paris",
    "agence Omra France",
    "voyage Omra Paris",
    "Hajj La Mecque France",
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
    title: "VisitMakkah Paris | Agence Hajj et Omra en France",
    description: "Agence VisitMakkah à Paris spécialisée dans le Hajj et la Omra. Organisation complète, accompagnement spirituel et services premium pour votre pèlerinage.",
    images: [
      {
        url: `${baseUrl}/images/makkah_logo.png`,
        width: 1200,
        height: 630,
        alt: "VisitMakkah Paris | Agence Hajj et Omra en France",
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
    "geo.region": "FR-75",
    "geo.placename": "Paris",
    "geo.position": "48.8566;2.3522",
    "ICBM": "48.8566, 2.3522",
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#000000",
    "google-site-verification": "1XkgTaFIhuamOMoRTA8Ez_JpXGk6_ZZCrih5Eo0hHo8",
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
        <CookieBanner />
        <WhatsAppButton />
      </body>
    </html>
  );
}
