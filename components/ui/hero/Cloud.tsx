import Image from 'next/image'

const Cloud = () => {
  return (
    <div className="relative w-full mb-32 md:mb-0">
        <Image src="/images/nuage2.png" alt="Makkah" width={1920} height={1080}
        className="w-full h-auto mt-[-90px] md:mt-[-200px] lg:mt-[-300px]"
        priority
        />
    <div className="bg-linear-to-b from-white/0 to-white w-full h-full absolute top-0 left-0 right-0 bottom-0" />
  </div>
  )
}

export { Cloud }