"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import type { TestimonialItem } from "@/hooks/useTestimonials";


export const TestimonialsRow = (props: {
  className?: string;
  testimonials: TestimonialItem[];
  duration?: number;
}) => {
  return (
    <div className={`overflow-hidden ${props.className || ''}`}>
      <motion.div
        animate={{
          translateX: "-50%",
        }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-row gap-6 pr-6"
        style={{ width: 'fit-content' }}
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {props.testimonials.map(({ text, image, name, role }, i) => (
                <div className="p-6 shadow-lg shadow-primary/10 min-w-[300px] w-[300px] max-h-[280px] border border-foreground/10 rounded-3xl bg-white/5 text-foreground flex-shrink-0 flex flex-col" key={i}>
                  <div className="line-clamp-5 text-sm leading-relaxed flex-1 overflow-hidden">{text}</div>
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-foreground/10">
                    {image ? (
                      <Image
                        width={40}
                        height={40}
                        src={image}
                        alt={name}
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <div className="font-medium tracking-tight leading-5">{name}</div>
                      {role && <div className="leading-5 opacity-60 tracking-tight text-xs">{role}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </React.Fragment>
          )),
        ]}
      </motion.div>
    </div>
  );
};

