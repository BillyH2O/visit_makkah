"use client";
import { aboutData } from '@/data/features/landing/about'

export const AboutSection = () => {
  return (
    <section 
      id="about-us" 
      className="w-full flex flex-col items-center gap-8 py-16 px-4 sm:px-8"
      aria-labelledby="about-heading"
    >
      <div className="max-w-4xl w-full">
        <h2 
          id="about-heading"
          className="text-3xl sm:text-4xl font-bold text-center mb-8 text-black dark:text-white"
        >
          {aboutData.title}
        </h2>
        
        <div className="flex flex-col gap-6 text-lg text-black dark:text-gray-300 leading-relaxed">
          {aboutData.content.map((paragraph, index) => (
            <p 
              key={index}
              className="text-justify"
              dangerouslySetInnerHTML={{ __html: paragraph.text }}
            />
          ))}
        </div>

        {/* SEO Keywords - Hidden but accessible */}
        <div className="sr-only" aria-hidden="true">
          {aboutData.keywords.join(', ')}
        </div>
      </div>

      {/* Decorative element */}
      <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mt-8"></div>
    </section>
  )
}

export default AboutSection
