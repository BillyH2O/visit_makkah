import InteractiveBentoGallery from "./interactive-bento-gallery"
import { SectionTitle } from "../../../ui/SectionTitle"
import { useGalleryItems } from "@/hooks/useGallery"
import Loader from "@/components/ui/Loader"

export function GallerySection() {
  const { data, loading } = useGalleryItems()
  const mediaItems = (data ?? []).map((g, idx) => ({
    id: idx + 1,
    type: g.type,
    title: g.title || '',
    desc: g.desc || '',
    url: g.url.startsWith('/') ? g.url : `/${g.url}`,
    span: g.span || '',
  }))
  return (
    <div className="max-h-screen overflow-y-auto w-full flex flex-col gap-16">
      <SectionTitle
        label="Galerie Photos"
        title="Vos souvenirs"
        text="Chaque voyage est une expérience unique. Revivez quelques instants forts partagés avec nos voyageurs."
        darkMode={true}
      />
      {loading ? (
        <Loader label="Chargement de la galerie..." />
      ) : (
        <InteractiveBentoGallery
          mediaItems={mediaItems}
        />
      )}
    </div>
  )
}
