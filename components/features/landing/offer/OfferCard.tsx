import Image, { ImageProps } from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type OfferCardProps = {
  className?: string;
  /** Optional size classes to override default width/height */
  sizeClassName?: string;
  gradientClassName?: string;
  title?: string;
  buttonLabel?: string;
  buttonClassName?: string;
  imageSrc: string;
  imageAlt?: string;
  imageClassName?: string;
  imageWidth?: number;
  imageHeight?: number;
  imagePriority?: ImageProps["priority"];
  baseHref?: string;
};

const OfferCard = ({
  className,
  sizeClassName,
  gradientClassName,
  title,
  buttonLabel,
  buttonClassName,
  imageSrc,
  imageAlt,
  imageClassName,
  imageWidth = 500,
  imageHeight = 500,
  imagePriority = false,
  baseHref = '/formules',
}: OfferCardProps) => {
  const showContent = Boolean(title || buttonLabel);

  return (
    <Link
      href={baseHref}
      className={cn(
        "relative rounded-4xl overflow-hidden border-2 border-primary group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/20",
        sizeClassName ?? "w-full h-[300px] md:h-[300px] lg:h-[400px] xl:h-[450px]",
        className
      )}
    >
      <Image
        src={imageSrc}
        alt={imageAlt ?? ""}
        width={imageWidth}
        height={imageHeight}
        className={cn("h-full w-full object-cover transition-transform duration-300 group-hover:scale-110", imageClassName)}
        priority={imagePriority}
      />

      {gradientClassName && (
        <div
          className={cn(
            "pointer-events-none absolute inset-0 z-10",
            gradientClassName
          )}
        />
      )}

      {showContent ? (
        <div className="absolute bottom-0 flex flex-col items-start gap-5 p-4 z-20">
          {title ? <h2 className="text-xl md:text-3xl text-white">{title}</h2> : null}
          {buttonLabel ? (
            <button
              className={cn(
                "rounded-full border border-white/5 bg-white/15 px-4 py-2 text-white transition-all duration-300 group-hover:bg-white/25 group-hover:border-white/20",
                buttonClassName
              )}
            >
              {buttonLabel}
            </button>
          ) : null}
        </div>
      ) : null}
    </Link>
  );
};

export default OfferCard;

