import type { Metadata } from "next";

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
  title: "Formules Omra - Packages Complets pour votre Pèlerinage",
  description: "Découvrez nos formules Omra complètes : formules premium et standard. Choisissez le package qui correspond à vos besoins pour votre voyage spirituel à La Mecque.",
  keywords: [
    "formule Omra",
    "package Omra",
    "formule premium Omra",
    "formule standard Omra",
    "voyage Omra complet",
    "forfait Omra",
    "offre Omra",
  ],
  openGraph: {
    title: "Formules Omra - Packages Complets pour votre Pèlerinage | VisitMakkah",
    description: "Découvrez nos formules Omra complètes : formules premium et standard pour votre voyage spirituel.",
    url: `${baseUrl}/formules`,
    type: "website",
  },
  twitter: {
    title: "Formules Omra - Packages Complets pour votre Pèlerinage",
    description: "Découvrez nos formules Omra complètes : formules premium et standard pour votre voyage spirituel.",
  },
  alternates: {
    canonical: `${baseUrl}/formules`,
  },
};

export default function FormulesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


