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
  title: "Visa Omra - Demande de Visa pour l'Arabie Saoudite",
  description: "Obtenez votre visa Omra pour l'Arabie Saoudite. Formules de visa disponibles, simulateur d'éligibilité et envoi de documents en ligne. Simplifiez vos démarches administratives.",
  keywords: [
    "visa Omra",
    "visa Arabie Saoudite",
    "demande visa",
    "e-visa Arabie Saoudite",
    "visa pèlerinage",
    "visa touristique Arabie Saoudite",
    "éligibilité visa",
  ],
  openGraph: {
    title: "Visa Omra - Demande de Visa pour l'Arabie Saoudite | VisitMakkah",
    description: "Obtenez votre visa Omra pour l'Arabie Saoudite. Formules disponibles, simulateur d'éligibilité et envoi de documents en ligne.",
    url: `${baseUrl}/visa`,
    type: "website",
  },
  twitter: {
    title: "Visa Omra - Demande de Visa pour l'Arabie Saoudite",
    description: "Obtenez votre visa Omra pour l'Arabie Saoudite. Formules disponibles, simulateur d'éligibilité et envoi de documents en ligne.",
  },
  alternates: {
    canonical: `${baseUrl}/visa`,
  },
};

export default function VisaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


