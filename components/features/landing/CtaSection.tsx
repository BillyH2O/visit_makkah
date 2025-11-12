
import { Badge } from '@/components/ui/Badge'
import Button from '../../ui/MainButton'

export const CtaSection = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center gap-12">
        <Badge label="Pourquoi nous ?" />
    <div className="w-full h-auto relative rounded-3xl overflow-hidden p-12 md:p-32 bg-[url('/images/makkah_cta.png')] bg-cover bg-center">
        <div className="absolute left-0 right-0 top-0 bottom-0 z-0 bg-black/40" />
        <div className="relative z-10 flex flex-col items-center justify-center text-center md:gap-12 gap-6">
        <h2 className="text-white text-2xl md:text-4xl lg:text-5xl font-semibold">
            Un accompagnement de confiance vers les lieux saints
        </h2>
        <p className="text-white text-xl font-medium">Le voyage de votre vie commence ici.</p>
        <div className="flex flex-row items-center justify-center gap-4">
            <Button label="Découvrir nos offres" size="sm" variant="primary" blur={true} href="/formules" />
            <Button label="Contactez-nous" size="sm" variant="neutral" blur={true} href="/contact" />
        </div>
        </div>
    </div>
    </div>
  )
}