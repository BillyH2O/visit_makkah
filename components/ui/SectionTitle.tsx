import { Badge } from "./Badge"

type Props = {
    label : string
    title : string
    text? : string
    warningText? : string
    darkMode?: boolean
}

export const SectionTitle = ({ label, title, text, warningText, darkMode = false }: Props) => {
  const textColor = darkMode ? 'text-white' : 'text-black';
  
  return (
    <div className="relative flex flex-col items-center justify-center gap-12 w-full">
        <Badge label={label} />
        <h1 className={`text-3xl md:text-5xl w-full xl:w-[1100px] font-bold text-center ${textColor}`}>{title}</h1>
        <div className="w-full sm:px-8 md:px-12 md:w-[700px] xl:w-[1250px] flex flex-col gap-4">
          {text && (
            <p className={`text-lg md:text-xl text-center ${textColor}`}>{text}</p>
          )}
          {warningText && (
            <p className="text-lg md:text-xl text-center !text-red-600 dark:!text-red-400 font-bold mt-2">
              {warningText}
            </p>
          )}
        </div>
      </div>
    )
}