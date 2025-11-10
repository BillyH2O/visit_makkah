import Button from '../MainButton'

interface HeroSectionProps {
  backgroundImage: string;
  title: string;
  description: string;
  button1Label: string;
  button2Label: string;
}

const HeroSection = ({ 
  backgroundImage, 
  title, 
  description, 
  button1Label, 
  button2Label 
}: HeroSectionProps) => {
  return (
    <section 
      className="w-full bg-cover bg-center"
      style={{ backgroundImage: `url('${backgroundImage}')` }}
    >
      <div className='w-[90%] md:w-full mx-auto min-h-screen flex flex-col items-center justify-center gap-16 bg-cover bg-center py-24 px-4 text-white'>
          <h1 className='w-full md:max-w-[800px] lg:max-w-[1000px] xl:max-w-[1500px] text-5xl sm:text-6xl md:text-7xl 2xl:text-8xl font-bold text-center'>{title}</h1>
          <p className='w-full max-w-6xl md:w-full text-lg font-medium md:text-2xl text-center'>{description}</p>
          <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
              <Button label={button1Label} size='sm' variant='primary' href='/formules' blur={true} />
              <Button label={button2Label} size='sm' variant='neutral' href='/visa' blur={true} />
          </div>
      </div>
    </section>
  )
}

export default HeroSection