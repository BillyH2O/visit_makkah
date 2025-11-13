"use client";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import MotifStrip from "@/components/ui/MotifStrip";
import { SectionTitle } from "@/components/ui/SectionTitle";

export default function MentionsLegales() {
  return (
    <div className="relative min-h-screen w-full font-sans dark:bg-black">
      <Navbar solid />

      <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-16">
        <div className="w-full flex flex-col items-center justify-center gap-16">
          <SectionTitle
            label="Informations"
            title="MENTIONS LÉGALES"
            text="Informations légales concernant Visit Makkah"
          />

          <div className="w-full prose prose-lg dark:prose-invert max-w-none space-y-6 text-black dark:text-white">
            <div>
              <h2 className="text-2xl font-semibold mb-4">1. Éditeur du site</h2>
              <p>
                Le site <strong>visit-makkah.fr</strong> est édité par :
              </p>
              <ul className="list-none ml-4 space-y-2 mt-2">
                <li><strong>Raison sociale :</strong> Visit Makkah</li>
                <li><strong>Email :</strong> <a href="mailto:visitmakkah@visit-makkah.fr" className="text-primary underline">visitmakkah@visit-makkah.fr</a></li>
                <li><strong>Site web :</strong> www.visit-makkah.fr</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">2. Directeur de publication</h2>
              <p>
                Le directeur de publication est le représentant légal de Visit Makkah.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">3. Hébergement</h2>
              <p>
                Le site est hébergé par un prestataire d&apos;hébergement web. Pour toute information concernant l&apos;hébergement, veuillez nous contacter.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">4. Propriété intellectuelle</h2>
              <p>
                L&apos;ensemble du contenu de ce site (textes, images, vidéos, logos, etc.) est la propriété exclusive de Visit Makkah, sauf mention contraire. Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans autorisation écrite préalable de Visit Makkah.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">5. Protection des données personnelles</h2>
              <p>
                Les données personnelles collectées sur ce site sont traitées conformément à notre <a href="/politique-de-confidentialite" className="text-primary underline">Politique de confidentialité</a> et au Règlement Général sur la Protection des Données (RGPD).
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">6. Cookies</h2>
              <p>
                Ce site utilise des cookies pour améliorer l&apos;expérience utilisateur. En continuant à naviguer sur ce site, vous acceptez l&apos;utilisation de cookies conformément à notre politique de confidentialité.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">7. Limitation de responsabilité</h2>
              <p>
                Visit Makkah s&apos;efforce d&apos;assurer l&apos;exactitude et la mise à jour des informations diffusées sur ce site. Toutefois, Visit Makkah ne peut garantir l&apos;exactitude, la précision ou l&apos;exhaustivité des informations mises à disposition sur ce site.
              </p>
              <p className="mt-2">
                Visit Makkah ne pourra être tenu responsable des dommages directs ou indirects causés au matériel de l&apos;utilisateur, lors de l&apos;accès au site, et résultant soit de l&apos;utilisation d&apos;un matériel ne répondant pas aux spécifications, soit de l&apos;apparition d&apos;un bug ou d&apos;une incompatibilité.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">8. Liens externes</h2>
              <p>
                Le site peut contenir des liens vers d&apos;autres sites web. Visit Makkah n&apos;est pas responsable du contenu de ces sites externes et décline toute responsabilité quant à leur contenu ou leur accessibilité.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">9. Droit applicable</h2>
              <p>
                Les présentes mentions légales sont régies par le droit français. En cas de litige, les tribunaux français seront seuls compétents.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">10. Contact</h2>
              <p>
                Pour toute question concernant ces mentions légales, vous pouvez nous contacter à :
              </p>
              <p className="mt-2">
                <strong>Email :</strong> <a href="mailto:visitmakkah@visit-makkah.fr" className="text-primary underline">visitmakkah@visit-makkah.fr</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <MotifStrip side="left" color="white" />
      <MotifStrip side="right" color="white" />
      <div className="w-full bg-black">
        <Footer />
      </div>
    </div>
  );
}

