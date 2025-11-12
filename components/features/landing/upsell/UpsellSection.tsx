"use client";
import React from "react";
import { MiniCard } from "./MiniCard";
import { upsellData } from "@/data";
import { Badge } from "@/components/ui/Badge";

export const UpsellSection: React.FC = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center gap-12">
        <Badge label="Nos rebriques" />
      <div className="w-full h-80 grid lg:grid-cols-6 grid-cols-2 gap-4">
        {upsellData.items.map((item, idx) => (
            <MiniCard key={idx} imageSrc={item.image} title={item.text} />
            ))}
        </div>
    </div>
  );
};

export default UpsellSection;


