"use client";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { 
  Users, 
  Calendar, 
  Languages, 
  Award, 
  BookOpen,
  Heart
} from "lucide-react";

type StatItem = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  description?: string;
};

const stats: StatItem[] = [
  {
    icon: Heart,
    title: "Omra effectués",
    value: "~720",
    description: "Omra organisées avec Visit Makkah"
  },
  {
    icon: Users,
    title: "Pèlerins accompagnés",
    value: "7000+",
    description: "Pèlerins déjà pris en charge"
  },
  {
    icon: Calendar,
    title: "Expérience",
    value: "10 ans",
    description: "D'ancienneté dans la ville sainte"
  },
  {
    icon: Languages,
    title: "Langues parlées",
    value: "3",
    description: "Arabe, Français et Anglais"
  },
  {
    icon: Award,
    title: "Expertise",
    value: "Multi-domaines",
    description: "Logistique, rites et accompagnement spirituel"
  },
  {
    icon: BookOpen,
    title: "Formation",
    value: "Science religieuse",
    description: "Étudiant en science religieuse"
  }
];

export const WhyUs = () => {
  return (
    <section className="w-full py-16 lg:py-32" style={{ backgroundColor: '#F7F5F1' }}>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full flex flex-col items-center justify-center gap-16">
          <SectionTitle
            label="Pourquoi nous ?"
            title="NOTRE EXPÉRIENCE À VOTRE SERVICE"
            text="Une équipe expérimentée et passionnée pour vous accompagner dans votre pèlerinage"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="flex flex-col items-center text-center gap-4 p-6 rounded-2xl bg-white/50 hover:bg-white/80 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-semibold text-black">
                      {stat.title} : <span className="text-primary">{stat.value}</span>
                    </h3>
                    {stat.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {stat.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

