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
  title: "Services - Transport et Accompagnement Omra",
  description: "Découvrez nos services d'accompagnement et de transport pour votre Omra à La Mecque. Transport aéroport, visites guidées et services sur mesure pour votre voyage spirituel.",
  keywords: [
    "services Omra",
    "transport La Mecque",
    "accompagnement Omra",
    "transport aéroport",
    "visites guidées La Mecque",
    "services pèlerinage",
  ],
  openGraph: {
    title: "Services - Transport et Accompagnement Omra | VisitMakkah",
    description: "Découvrez nos services d'accompagnement et de transport pour votre Omra à La Mecque.",
    url: `${baseUrl}/services`,
    type: "website",
  },
  twitter: {
    title: "Services - Transport et Accompagnement Omra",
    description: "Découvrez nos services d'accompagnement et de transport pour votre Omra à La Mecque.",
  },
  alternates: {
    canonical: `${baseUrl}/services`,
  },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


