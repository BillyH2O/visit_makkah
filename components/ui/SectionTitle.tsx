import { Badge } from "./Badge"

type Props = {
    label : string
    title : string
    text? : string
    darkMode?: boolean
}

export const SectionTitle = ({ label, title, text, darkMode = false }: Props) => {
  const textColor = darkMode ? 'text-white' : 'text-black';
  
  return (
    <div className="relative flex flex-col items-center justify-center gap-12 w-full">
        <Badge label={label} />
        <h1 className={`text-3xl md:text-5xl w-full xl:w-[1100px] font-bold text-center ${textColor}`}>{title}</h1>
        <p className={`w-full sm:px-8 md:px-12 xl:w-[1250px] text-lg md:text-xl text-center ${textColor}`}>{text}</p>
      </div>
    )
}