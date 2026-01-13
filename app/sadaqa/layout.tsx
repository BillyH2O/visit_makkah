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
  title: "Sadaqa - Aumônes et Actes de Charité",
  description: "Participez à des actes de charité (Sadaqa) pour votre Omra : Omra Badal, sacrifice de mouton, Sadaqa Jariya et dépôt de Coran à la Mosquée Sacrée. Faites une bonne action pendant votre pèlerinage.",
  keywords: [
    "Sadaqa",
    "aumône",
    "Omra Badal",
    "sacrifice mouton",
    "Sadaqa Jariya",
    "charité musulmane",
    "actes de bienfaisance",
    "dépôt Coran Mosquée Sacrée",
  ],
  openGraph: {
    title: "Sadaqa - Aumônes et Actes de Charité | VisitMakkah",
    description: "Participez à des actes de charité pour votre Omra : Omra Badal, sacrifice de mouton, Sadaqa Jariya et plus.",
    url: `${baseUrl}/sadaqa`,
    type: "website",
  },
  twitter: {
    title: "Sadaqa - Aumônes et Actes de Charité",
    description: "Participez à des actes de charité pour votre Omra : Omra Badal, sacrifice de mouton, Sadaqa Jariya et plus.",
  },
  alternates: {
    canonical: `${baseUrl}/sadaqa`,
  },
};

export default function SadaqaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


