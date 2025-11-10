"use client";

interface FaqItemProps {
  question: string;
  answer: string;
  index: number;
  openIndex: number | null;
  onClick: () => void;
}

export const FaqItem = ({ question, answer, index, openIndex, onClick }: FaqItemProps) => {
  const isOpen = openIndex === index;

  return (
    <div className="w-full border-b border-slate-200 py-4 cursor-pointer" onClick={onClick}>
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium">
          {question}
        </h3>
        <svg 
          width="18" 
          height="18" 
          viewBox="0 0 18 18" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className={`${isOpen ? "rotate-180" : ""} transition-all duration-500 ease-in-out`}
        >
          <path 
            d="m4.5 7.2 3.793 3.793a1 1 0 0 0 1.414 0L13.5 7.2" 
            stroke="#1D293D" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        </svg>
      </div>
      <p 
        className={`text-sm text-slate-500 transition-all duration-500 ease-in-out max-w-md ${
          isOpen ? "opacity-100 max-h-[300px] translate-y-0 pt-4" : "opacity-0 max-h-0 -translate-y-2"
        }`}
      >
        {answer}
      </p>
    </div>
  );
};

