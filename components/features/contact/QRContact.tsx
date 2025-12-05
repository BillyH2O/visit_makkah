import Image from 'next/image'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { InstagramIcon } from 'lucide-react'

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
  const socialLinks = [
    {
      title: 'Instagram',
      href: 'https://www.instagram.com/VisitMakkah.guideomra',
      icon: InstagramIcon,
    },
    {
      title: 'TikTok',
      href: 'https://www.tiktok.com/@VisitMakkah.guideomra',
      icon: () => (
        <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
      ),
    },
    {
      title: 'Snapchat',
      href: 'https://www.snapchat.com/add/Visitmakkah',
      icon: () => (
        <Image 
          src="/images/snap.png" 
          alt="Snapchat" 
          width={20} 
          height={20}
          className="size-5"
        />
      ),
    },
  ]

  return (
    <section className="mt-24 w-full max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col gap-12 items-center">
      <SectionTitle label={label} title={title} text={text} />
      <div className="w-full flex flex-col items-center gap-8">
        <div className="w-full flex items-center justify-center">
          <Image
            src={imageSrc}
            alt="QR Code - Contact direct"
            width={500}
            height={500}
            className="w-[400px] h-[400px] sm:w-[540px] sm:h-[540px] md:w-[580px] md:h-[580px] rounded-xl object-contain bg-white"
            priority
          />
        </div>
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground">Suivez-nous sur nos réseaux sociaux</p>
          <div className="flex gap-3">
            {socialLinks.map((link) => {
              const IconComponent = link.icon
              return (
                <a
                  key={link.title}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-primary/30 hover:border-primary transition-colors"
                  aria-label={link.title}
                >
                  <IconComponent />
                </a>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default QRContact


