import Image from 'next/image'
import { SectionTitle } from '@/components/ui/SectionTitle'

type QRContactProps = {
  imageSrc: string
  label?: string
  title?: string
  text?: string
}

const QRContact = ({
  imageSrc,
  label = 'Contact',
  title = 'CONTACT DIRECT VIA QR CODE',
  text = 'Accédez rapidement à nos canaux de communication via QR Code. Scannez et discutez avec nous',
}: QRContactProps) => {
  return (
    <section className="mt-24 w-full max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col gap-12 items-center">
      <SectionTitle label={label} title={title} text={text} />
      <div className="w-full flex items-center justify-center">
        <Image
          src={imageSrc}
          alt="QR Code - Contact direct"
          width={320}
          height={320}
          className="w-[240px] h-[240px] sm:w-[280px] sm:h-[280px] md:w-[320px] md:h-[320px] rounded-xl object-contain bg-white"
          priority
        />
      </div>
    </section>
  )
}

export default QRContact


