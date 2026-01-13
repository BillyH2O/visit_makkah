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
  title: "Contact - VisitMakkah",
  description: "Contactez VisitMakkah pour vos questions sur l'Omra, les visas, les formules et les services. Email : visitmakkah@visit-makkah.fr | WhatsApp : +966 54 731 9133",
  keywords: [
    "contact VisitMakkah",
    "support Omra",
    "aide pèlerinage",
    "questions visa",
  ],
  openGraph: {
    title: "Contact - VisitMakkah",
    description: "Contactez VisitMakkah pour vos questions sur l'Omra, les visas, les formules et les services.",
    url: `${baseUrl}/contact`,
    type: "website",
  },
  twitter: {
    title: "Contact - VisitMakkah",
    description: "Contactez VisitMakkah pour vos questions sur l'Omra, les visas, les formules et les services.",
  },
  alternates: {
    canonical: `${baseUrl}/contact`,
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


