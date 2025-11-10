"use client";
import { useState } from "react";
import { SectionTitle } from "../../../ui/SectionTitle";
import { FaqItem } from "./FaqItem";
import { faqData } from "@/data";
import { useFaqItems } from "@/hooks/useFaq";
import Loader from "@/components/ui/Loader";

const FaqSection = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const { data: faqItems, loading } = useFaqItems();

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return ( 
        <div className="relative w-full px-4 sm:px-12 xl:px-32 2xl:px-0 py-32 max-w-4xl mx-auto flex flex-col items-center justify-center gap-24 ">
            <SectionTitle
                label={faqData.text.label} 
                title={faqData.text.title} 
                text={faqData.text.text} 
            />
            {loading ? (
              <Loader label="Chargement de la FAQ..." />
            ) : (
              <div className="w-full flex flex-col items-center justify-center gap-4">
              {(faqItems ?? []).map((faq, index) => (
                  <FaqItem
                      key={faq.id}
                      question={faq.question}
                      answer={faq.answer}
                      index={index}
                      openIndex={openIndex}
                      onClick={() => handleToggle(index)}
                  />
              ))}
              </div>
            )}
        </div>
    );
};

export default FaqSection;