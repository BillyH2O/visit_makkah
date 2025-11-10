import { Dessin } from './Dessin'
import { dessinData, dessinMedineData } from '@/data'

const PresentationSection = () => {
  return (
    <div className="w-full h-full">
    <Dessin
        backgroundColor={dessinData.backgroundColor}
        label={dessinData.label}
        title={dessinData.title}
        paragraph={dessinData.paragraph}
        imageSrc={dessinData.imageSrc}
        imageAlt={dessinData.imageAlt}
      />
      <Dessin
        backgroundColor={dessinMedineData.backgroundColor}
        label={dessinMedineData.label}
        title={dessinMedineData.title}
        paragraph={dessinMedineData.paragraph}
        imageSrc={dessinMedineData.imageSrc}
        imageAlt={dessinMedineData.imageAlt}
        reverseOrder={true}
        labelColor={dessinMedineData.labelColor}
      />
    </div>
  )
}

export default PresentationSection