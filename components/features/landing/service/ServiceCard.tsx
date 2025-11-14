import Image, { ImageProps } from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ServiceCardProps = {
  className?: string;
  gradientClassName?: string;
  title?: string;
  bio?: string;
  buttonLabel?: string;
  buttonClassName?: string;
  imageSrc: string;
  imageAlt?: string;
  imageClassName?: string;
  imageWidth?: number;
  imageHeight?: number;
  imagePriority?: ImageProps["priority"];
  productId?: string;
  productSlug?: string;
};

const ServiceCard = ({
  className,
  gradientClassName,
  title,
  bio,
  buttonLabel,
  buttonClassName,
  imageSrc,
  imageAlt,
  imageClassName,
  imageWidth = 500,
  imageHeight = 500,
  imagePriority = false,
}: ServiceCardProps) => {
  const showContent = Boolean(title || bio || buttonLabel);
  const href = '/services';

  return (
    <Link
      href={href}
      className={cn(
        "relative w-full h-[350px] rounded-3xl overflow-hidden border-2 border-primary group cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 block",
        className
      )}
    >
      <Image
        src={imageSrc}
        alt={imageAlt ?? ""}
        width={imageWidth}
        height={imageHeight}
        className={cn("h-full w-full object-cover transition-transform duration-300 group-hover:scale-105", imageClassName)}
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
          {bio ? <p className="text-sm md:text-base text-white/90">{bio}</p> : null}
          {buttonLabel ? (
            <span
              className={cn(
                "rounded-full border border-white/5 bg-white/15 px-4 py-2 text-white transition-all duration-300 group-hover:bg-white/25 group-hover:border-white/20 inline-block",
                buttonClassName
              )}
            >
              {buttonLabel}
            </span>
          ) : null}
        </div>
      ) : null}
    </Link>
  );
};

export default ServiceCard;

