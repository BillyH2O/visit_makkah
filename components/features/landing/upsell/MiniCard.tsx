"use client";
import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface MiniCardProps {
  imageSrc: string;
  title: string;
  href?: string;
  onClick?: () => void;
}

const getHrefFromTitle = (title: string): string => {
  const normalizedTitle = title.toLowerCase().trim();
  if (normalizedTitle.includes('omra')) return '/formules';
  if (normalizedTitle.includes('medine')) return '/formules';
  if (normalizedTitle.includes('service')) return '/services';
  if (normalizedTitle.includes('sadaqa')) return '/sadaqa';
  if (normalizedTitle.includes('visa')) return '/visa';
  if (normalizedTitle.includes('contact')) return '/contact';
  return '/';
};

export const MiniCard: React.FC<MiniCardProps> = ({ imageSrc, title, href, onClick }) => {
  const linkHref = href || getHrefFromTitle(title);
  
  const cardContent = (
    <div
      className="relative col-span-1 w-full h-full bg-cover bg-center rounded-3xl overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.02]"
      style={{ backgroundImage: `url('${imageSrc}')` }}
    >
      <div className="bg-gradient-to-b from-transparent to-black/50 absolute inset-0 rounded-3xl transition-opacity duration-300 group-hover:opacity-80" />
      <h3 className="absolute top-5 left-5 text-center text-white text-xl font-medium z-10">
        {title}
      </h3>
      <div className="absolute bottom-0 right-0 bg-[#000904] border-black/50 rounded-tl-3xl w-16 h-16 flex items-center justify-center group-hover:bg-[#000904]/90 transition-colors duration-300">
        <div className="bg-primary relative rounded-full w-10 h-10 flex items-center justify-center group-hover:bg-primary/90 transition-colors duration-300">
          <ArrowUpRight className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" />
        </div>
      </div>
    </div>
  );

  if (onClick) {
    return (
      <div onClick={onClick}>
        {cardContent}
      </div>
    );
  }

  return (
    <Link href={linkHref}>
      {cardContent}
    </Link>
  );
};

export default MiniCard;


