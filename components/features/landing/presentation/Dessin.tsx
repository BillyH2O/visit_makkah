import Image from "next/image";

interface DessinProps {
  backgroundColor: string;
  label: string;
  title: string;
  paragraph: string;
  imageSrc: string;
  imageAlt?: string;
  reverseOrder?: boolean;
  labelColor?: string;
}

export const Dessin = ({
  backgroundColor,
  label,
  title,
  paragraph,
  imageSrc,
  imageAlt = "Image",
  reverseOrder = false,
  labelColor,
}: DessinProps) => {
  const flexDirection = reverseOrder 
    ? "flex-col-reverse lg:flex-row-reverse" 
    : "flex-col-reverse lg:flex-row";

  const labelStyle = labelColor 
    ? { borderColor: labelColor, color: labelColor, borderWidth: '1px', borderStyle: 'solid' }
    : {};

  return (
    <div className={`relative w-full h-full ${backgroundColor}`}>
      <div className={`w-full max-w-7xl mx-auto flex ${flexDirection} items-center justify-center gap-4 lg:gap-12 xl:gap-20 2xl:gap-24 py-20 sm:p-12 md:p-16 px-4 sm:px-12 xl:px-32 2xl:px-0`}>
        <div className="flex flex-col justify-center gap-4 text-left w-full">
          <label 
            className={`w-fit text-md font-semibold text-center rounded-full px-4 py-2 border ${labelColor ? '' : 'text-primary border-primary'}`}
            style={labelStyle}
          >
            {label}
          </label>
          <h1 className="text-4xl font-bold">{title}</h1>
          <div 
            className="text-lg [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:space-y-2 [&_li]:ml-4" 
            dangerouslySetInnerHTML={{ __html: paragraph }} 
          />
        </div>
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={1000}
          height={1000}
          className="sm:w-[80%] md:w-[50%] xl:w-[550px] h-full object-cover"
        />
      </div>
    </div>
  );
};

