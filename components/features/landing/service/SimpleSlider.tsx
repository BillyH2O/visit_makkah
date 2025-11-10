"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SimpleSliderProps = {
  children: React.ReactNode;
  className?: string;
  itemClassName?: string;
  itemsPerView?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
};

const SimpleSlider = ({
  children,
  className,
  itemClassName,
  itemsPerView = { mobile: 1, tablet: 2, desktop: 3 },
}: SimpleSliderProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const firstItem = container.querySelector(".slider-item") as HTMLElement;
    if (!firstItem) return;
    
    const itemWidth = firstItem.offsetWidth;
    const gap = 24; // gap-6 = 24px
    const scrollAmount = itemWidth + gap;

    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className={cn("flex flex-col items-center gap-4 w-full", className)}>
      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth pb-4 w-full"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          paddingRight: "0px",
        }}
      >
        {Array.isArray(children)
          ? children.map((child, index) => (
              <div
                key={index}
                className={cn(
                  "slider-item shrink-0 snap-start",
                  itemClassName || `w-[calc(100%-24px)] sm:w-[calc(50%-12px)] md:w-[calc(${
                    100 / (itemsPerView.desktop || 3)
                  }%-16px)]`
                )}
              >
                {child}
              </div>
            ))
          : children}
      </div>

      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-background/90 backdrop-blur-sm hover:bg-background shadow-lg border-2"
          onClick={() => scroll("left")}
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-background/90 backdrop-blur-sm hover:bg-background shadow-lg border-2"
          onClick={() => scroll("right")}
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default SimpleSlider;

