"use client"

import Button from '../MainButton'

interface HeroSectionProps {
  backgroundImage: string;
  darkEffect?: boolean;
  title: string;
  description: string;
  button1Label: string;
  button2Label: string;
  id: string;
  id2?: string | null;
}

const HeroSection = ({ 
  backgroundImage, 
  darkEffect = false,
  title, 
  description, 
  button1Label, 
  button2Label,
  id,
  id2 = "/"
}: HeroSectionProps) => {
  return (
    <section 
      className="relative w-full bg-cover bg-center cn"
      style={{ backgroundImage: `url('${backgroundImage}')` }}
    >
      
      {darkEffect && <div className="absolute inset-0 bg-black/10 z-10" />}
      <div className="relative w-[90%] md:w-full mx-auto min-h-screen flex flex-col items-center justify-center gap-16 py-24 px-4 text-white z-20">
          <h1 className='w-full md:max-w-[800px] lg:max-w-[1000px] xl:max-w-[1500px] text-3xl sm:text-4xl md:text-5xl 2xl:text-7xl font-bold text-center'>{title}</h1>
          <p className='w-full max-w-6xl md:w-full text-lg font-medium md:text-2xl text-center'>{description}</p>
          <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
              <Button label={button1Label} size='sm' variant='primary' href={`${id}`} blur={true} />
              <Button label={button2Label} size='sm' variant='neutral' href={`${id2}`} blur={true} />
          </div>
      </div>
    </section>
  )
}

export default HeroSection