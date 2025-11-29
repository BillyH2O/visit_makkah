/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient, PricingType, CategoryCode } = require('@prisma/client');

const prisma = new PrismaClient();

function slugify(input) {
  return input
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parsePriceToCents(price) {
  if (price == null) return null;
  const str = String(price).replace(/[^0-9.,]/g, '').replace(',', '.');
  if (!str) return null;
  const value = Number.parseFloat(str);
  if (Number.isNaN(value)) return null;
  return Math.round(value * 100);
}

async function ensureCategories() {
  const categories = [
    { code: 'OFFRE', slug: 'offre', name: 'Offres' },
    { code: 'SADAQA', slug: 'sadaqa', name: 'Sadaqa' },
    { code: 'VISA', slug: 'visa', name: 'Visa' },
    { code: 'SERVICE', slug: 'services', name: 'Services' },
  ];
  const out = {};
  for (const c of categories) {
    const created = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, code: CategoryCode[c.code] },
      create: { slug: c.slug, name: c.name, code: CategoryCode[c.code] },
    });
    out[c.code] = created.id;
  }
  return out;
}

function buildSeedData(categoryIds) {
  const EUR = 'EUR';

  // OFFRES
  const offres = [
    {
      title: 'Formule Premium Makkah + Médine',
      description: '<ul class="list-disc list-inside"><li>Guide de 1 à 3 personnes</li><li>Transfert aéroport Jeddah Makkah</li><li>Guide privé Omra</li><li>Visite des rites du hajj</li><li>Transfert Makkah aéroport Jeddah</li><li>Visite légiférée à Médine</li><li>Cimetière Baqi</li><li>Présentation de la mosquée sacrée du prophète</li><li>Visite Quba</li><li>Visite cimetière Ouhoud</li></ul>',
      image: '/images/violet_masjid.png',
      price: '740',
      firstPrice: '',
      landingTitle: 'Formule Premium Makkah + Médine',
      landingGradientClassName: "rounded-4xl bg-[linear-gradient(to_top,rgba(36,2,51,0.8)_8%,rgba(241,216,166,0)_60%)]",
      detailTitle: 'Formule Premium Makkah + Médine',
      longDescriptionHtml: '<ul class="list-disc list-inside"><li>Guide de 1 à 3 personnes</li><li>Transfert aéroport Jeddah Makkah</li><li>Guide privé Omra</li><li>Visite des rites du hajj</li><li>Transfert Makkah aéroport Jeddah</li><li>Visite légiférée à Médine</li><li>Cimetière Baqi</li><li>Présentation de la mosquée sacrée du prophète</li><li>Visite Quba</li><li>Visite cimetière Ouhoud</li></ul>',
      categoryId: categoryIds.OFFRE,
      isPremium: true,
      metadata: {
        includedPeople: 3,
        extraPerPersonCents: 10000, // 100€ par personne supplémentaire au-delà de 3
      },
    },
    {
      title: 'Formule complète à Makkah',
      description: '<ul class="list-disc list-inside"><li>Accompagnement complet Omra à Makkah de 1 à 3 personnes</li><li>Transfert aller aéroport Jeddah à Makkah</li><li>Omra privée</li><li>Visite des lieux sacrés (Arafat, Mina, Mouzdelifa, Jamarat) durée de 2 à 3 heures</li><li>Transfert Makkah - gare de train ou aéroport de Jeddah</li></ul>',
      image: '/images/makkah_illustration.png',
      price: '490',
      firstPrice: '540',
      landingTitle: 'Formule complète à Makkah',
      landingGradientClassName: "rounded-4xl bg-[linear-gradient(to_top,rgba(26,24,18,0.8)_8%,rgba(241,216,166,0)_60%)]",
      detailTitle: 'Formule complète à Makkah',
      longDescriptionHtml: '<ul class="list-disc list-inside"><li>Accompagnement complet Omra à Makkah de 1 à 3 personnes</li><li>Transfert aller aéroport Jeddah à Makkah</li><li>Omra privée</li><li>Visite des lieux sacrés (Arafat, Mina, Mouzdelifa, Jamarat) durée de 2 à 3 heures</li><li>Transfert Makkah - gare de train ou aéroport de Jeddah</li></ul>',
      detailColorHex: '#FDF6E2',
      categoryId: categoryIds.OFFRE,
      metadata: {
        includedPeople: 3,
        extraPerPersonCents: 7500, // 75€ par personne supplémentaire au-delà de 3
      },
    },
    {
      title: 'Formule standard accompagnement Omra',
      description: '<ul class="list-disc list-inside"><li>Guide privé de 1 à 6 personnes</li><li>Rite de la Omra</li><li>Arafat</li><li>Mouzdelifa</li><li>Mina</li><li>Jamarat</li><li>Djébel el-Nour</li></ul>',
      image: '/images/clocktower.png',
      price: '260',
      firstPrice: '280',
      landingTitle: 'Formule standard à Makkah',
      landingGradientClassName: "rounded-4xl bg-[linear-gradient(to_top,rgba(0,53,128,0.7)_8%,rgba(241,216,166,0)_60%)]",
      detailTitle: 'Formule standard accompagnement Omra',
      longDescriptionHtml: '<ul class="list-disc list-inside"><li>Guide privé de 1 à 6 personnes</li><li>Rite de la Omra</li><li>Arafat</li><li>Mouzdelifa</li><li>Mina</li><li>Jamarat</li><li>Djébel el-Nour</li></ul>',
      detailColorHex: '#E9FAFF',
      categoryId: categoryIds.OFFRE,
      metadata: {
        extraPerPersonCents: 1500, // 15€ par personne supplémentaire
      },
    },
    {
      title: 'Formule complète à Médine',
      description: '<ul class="list-disc list-inside"><li>Pour un groupe de 1 à 4 personnes</li><li>Transfert gare hôtel</li><li>Visite des lieux légiférés</li><li>Transfert hôtel gare</li></ul>',
      image: '/images/nabawi_illustration.png',
      price: '260',
      firstPrice: '280',
      landingTitle: 'Formule complète à Médine',
      landingGradientClassName: "rounded-4xl bg-[linear-gradient(to_top,rgba(2,51,16,0.8)_8%,rgba(241,216,166,0)_60%)]",
      detailTitle: 'Formule complète à Médine',
      longDescriptionHtml: '<ul class="list-disc list-inside"><li>Pour un groupe de 1 à 4 personnes</li><li>Transfert gare hôtel</li><li>Visite des lieux légiférés</li><li>Transfert hôtel gare</li></ul>',
      detailColorHex: '#EDFFF3',
      categoryId: categoryIds.OFFRE,
      metadata: {
        includedPeople: 4,
        extraPerPersonCents: 5000, // 50€ par personne supplémentaire au-delà de 4
      },
    },
  ];

  // SERVICES
  const services = [
    {
      title: 'Omra privée de 1 à 8 personnes',
      description: "<p>Au départ du haram, regroupement esplanade.</p>",
      image: '/images/omra_prive.png',
      price: '140€',
      infoLabel: '+20€/personne supplémentaire',
      landingTitle: 'Omra privée',
      landingBio: 'de 1 à 8 personnes',
      landingGradientClassName: "rounded-3xl bg-[linear-gradient(to_top,rgba(41,36,39)_40%,rgba(243,244,246,0)_60%)]",
      categoryId: categoryIds.SERVICE,
    },
    {
      title: 'Visite des lieux sacrés Makkah de 1 à 5 personnes',
      description: '<p>Entre foi, histoire et dévotion.</p>',
      image: '/images/hajj.png',
      price: '130€',
      landingTitle: 'Visite guidée à Makkah',
      landingBio: 'Découvrez les lieux saints avec un guide.',
      landingGradientClassName: "rounded-3xl bg-[linear-gradient(to_top,rgba(175,158,131)_40%,rgba(243,244,246,0)_60%)]",
      categoryId: categoryIds.SERVICE,
    },
    {
      title: 'Visite à Médine de 1 à 5 personnes',
      description: "<p>Transfert gare hôtel, Visite des lieux légiférés, Transfert hôtel gare</p>",
      image: '/images/nabawi_photo.png',
      price: '150€',
      landingTitle: 'Visite guidée à Médine',
      landingBio: 'Découvrez les lieux saints avec un guide.',
      landingGradientClassName: "rounded-3xl bg-[linear-gradient(to_top,rgba(2,51,16,0.8)_40%,rgba(120,53,15,0)_60%)]",
      categoryId: categoryIds.SERVICE,
    },
    {
      title: "Aéroport Jeddah vers Hôtel Makkah (et inversement)",
      description: "<p>Offre de 1 à 4 personnes. Chauffeur dédié, prise en charge à l’heure.</p>",
      image: '/images/car.png',
      price: '130€',
      landingTitle: 'Transport sécurisé',
      landingBio: 'Véhicules confortables pour vos déplacements.',
      landingGradientClassName: "rounded-3xl bg-[linear-gradient(to_top,rgba(0,0,0)_40%,rgba(0,0,0,0)_60%)]",
      categoryId: categoryIds.SERVICE,
    },
    {
      title: 'Gare vers Hôtel (et inversement)',
      description: "<p>Offre de 1 à 4 personnes. Chauffeur dédié, prise en charge à l’heure.</p>",
      image: '/images/car.png',
      price: '50€',
      landingTitle: 'Transport sécurisé',
      landingBio: 'Véhicules confortables pour vos déplacements.',
      landingGradientClassName: "rounded-3xl bg-[linear-gradient(to_top,rgba(0,0,0)_40%,rgba(0,0,0,0)_60%)]",
      categoryId: categoryIds.SERVICE,
    },
    {
      title: "Réservation d'hotel",
      description: "Réservation d'hôtel — tarifs négociés",
      image: '/images/hotel.png',
      price: '190€',
      infoLabel: '+100€/personne supplémentaire',
      landingTitle: "Réservation d'hôtel",
      landingBio: 'Les meilleurs hôtels à des prix imbattables.',
      landingGradientClassName: "rounded-3xl bg-[linear-gradient(to_top,rgba(107,114,128,0.8)_40%,rgba(107,114,128,0)_60%)]",
      detailTitle: "Réservation d'hotel",
      longDescriptionHtml: "En réservant votre hôtel via Visit Mekkah, vous profitez des meilleurs tarifs négociés (encore plus favorable que chez Booking) tout en soutenant une initiative familiale.<br /><br />C'est plus avantageux pour vous, et cela permet à notre équipe de vous accompagner sans frais supplémentaires.",
      categoryId: categoryIds.SERVICE,
      isHighlight: true,
    },
  ];

  // VISA
  const visa = [
    {
      title: '🌙 Visa Omra',
      description: "<p>Un accès spirituel ouvert à tous.<br></br></p><ul class='list-disc list-inside'><li>Disponible pour tous les voyageurs musulmans.</li><li>Permet d'accomplir la Omra à La Mecque.</li></ul></br><p><strong>Documents requis :</strong></p><ul class='list-disc list-inside'><li>Passeport valide 6 mois après la date d'entrée prévue.</li><li>Titre de séjour français valide (original + copie).</li><li>Réservation d'hôtel (ou certificat d'hébergement).</li><li>Billet d'avion aller-retour.</li><li>Assurance voyage couvrant tout le séjour.</li></ul>",
      image: '/images/visa1.png',
      price: '250',
      detailColorHex: '#E8EFF5',
      categoryId: categoryIds.VISA,
    },
    {
      title: '🌍 Ressortissants étrangers résidant en Schengen, USA ou Royaume-Uni',
      description: "<p>Une option accessible sous conditions précises.</p><br/><p><strong>Concernés :</strong> Algérie 🇩🇿 et Maroc 🇲🇦</p><p>⚠️ Tunisie : difficultés actuelles pour l'e-Visa.</p><br/><p><strong>Conditions d'éligibilité :</strong></p><ul class='list-disc list-inside'><li>Moins de 60 ans.</li><li>Être titulaire d'un titre de résident pour USA / UK / UE, OU d'un visa valide ≥ 3 mois pour Schengen / USA / UK, déjà utilisé au moins une fois.</li></ul><br/><p><strong>Documents requis :</strong></p><ul class='list-disc list-inside'><li>Passeport valide 6 mois après la date d'entrée prévue.</li><li>Titre de séjour français valide (original + copie).</li></ul>",
      image: '/images/visa2.png',
      price: '250',
      detailColorHex: '#F3EFE1',
      categoryId: categoryIds.VISA,
    },
    {
      title: '🕌 Visa Touriste (e-Visa Arabie Saoudite)',
      description: "<p>Un accès facilité pour vos séjours sacrés et culturels.</p><br/><ul class='list-disc list-inside'><li><strong>Concernés :</strong> ressortissants de l'Espace Schengen, USA et Royaume-Uni.</li><li>Visa multi-entrées valable 1 an.</li><li>Séjours de 90 jours maximum par an.</li><li>Valable pour : tourisme, famille, événements, pèlerinage.</li></ul>",
      image: '/images/visa3.png',
      price: '150',
      detailColorHex: '#F9E9D6',
      categoryId: categoryIds.VISA,
    },
  ];

  // SADAQA
  const sadaqa = [
    {
      title: 'Omra Badal',
      description: "L’Omra Badal (عُمرة البدل) signifie accomplir la Omra en faveur d’une autre personne.",
      longDescriptionHtml:
        "<p>L’Omra Badal (عُمرة البدل) signifie accomplir la Omra en faveur d’une autre personne, en général :</p></br>" +
        "<ul class='list-disc list-inside'><li>Pour une personne décédée (parents, proche etc.)</li><li>Pour une personne vivante mais incapable physiquement de faire l’Omra elle-même (maladie chronique, handicap, vieillesse…)</li></ul></br>" +
        "<p><strong>Quelle est la règle en Islam ?</strong><br/>L’Omra Badal est permise et même recommandée dans certains cas. Elle repose sur des hadiths authentiques.</p>" +
        "</br><p><strong>Hadith authentique :</strong><br/>Une femme dit au Prophète ﷺ : \"Ô Messager d’Allah, ma mère a fait le vœu de faire le Hajj, mais elle est morte avant de le faire. Dois-je le faire à sa place ?\"<br/>Il répondit : \"Oui. Si ta mère avait une dette, ne la paierais-tu pas pour elle ? La dette envers Allah est plus prioritaire.\"<br/>(Rapporté par Al-Bukhari et Muslim)<br/></br>Cela s'applique également à l’Omra.</p>",
      image: '/images/omra_badal.png',
      price: '190€',
      infoLabel: "Lors de la réservation la personne doit s'acquitter de la totalité.",
      detailColorHex: '#2F201A',
      landingGradientClassName: "rounded-4xl bg-[linear-gradient(to_top,rgba(0,0,0,0.8)_8%,rgba(0,0,0,0)_60%)]",
      categoryId: categoryIds.SADAQA,
    },
    {
      title: 'Sacrifice de mouton',
      description: "Faites votre sacrifice de mouton; la viande sera distribuée à des nécessiteux.",
      longDescriptionHtml:
        "<p>Faites votre sacrifice de mouton ici, que ce soit pour l’Aïd, la akika ou une sadaqa, sachez que la viande sera distribuée à des nécessiteux.</p>" +
        "</br><ul class='list-disc list-inside'><li>Étudiants en science</li><li>Plus démunis</li><li>Etc.</li></ul>" +
        "</br><p>Une vidéo pourra être fournie si vous le souhaitez.</p>",
      image: '/images/mouton.png',
      price: '180€',
      detailColorHex: '#2D4F79',
      landingGradientClassName: "rounded-4xl bg-[linear-gradient(to_top,rgba(0,0,0,0.8)_8%,rgba(0,0,0,0)_60%)]",
      categoryId: categoryIds.SADAQA,
    },
    {
      title: 'Sadaqa jâriya',
      description: 'Aumône continue aux effets durables.',
      longDescriptionHtml:
        "<p>Une sadaqa jâriya (صدقة جارية), en islam, est une aumône continue dont les récompenses durent dans le temps, même après la mort de celui qui l’a accomplie.</p>" +
        "</br><p><strong>Définition simple</strong><br/>\"Sadaqa\" = aumône<br/>\"Jâriya\" = continue, qui coule, qui dure</p>" +
        "</br><p>Donc, une sadaqa jâriya est un acte de bien durable, dont les bénéfices continuent à profiter aux gens avec le temps, et qui rapporte des récompenses permanentes à celui ou celle qui l’a fait — même dans sa tombe.</p>" +
        "</br><p><strong>Hadith de référence</strong><br/>Le Prophète ﷺ a dit : \"Lorsque le fils d'Adam meurt, ses œuvres s’arrêtent sauf dans trois cas :\"<br/>- Une sadaqa jâriya (aumône continue)<br/>- Une science utile dont les gens bénéficient<br/>- Un enfant pieux qui invoque pour lui. </br>(Rapporté par Muslim, n°1631)</p>",
      image: '/images/fauteuil.png',
      price: '95€',
      detailColorHex: '#C0C0C0',
      landingGradientClassName: "rounded-4xl bg-[linear-gradient(to_top,rgba(0,0,0,0.8)_8%,rgba(0,0,0,0)_60%)]",
      categoryId: categoryIds.SADAQA,
    },
    {
      title: 'Dépôt de Coran à la Mosquée Sacrée',
      description: 'Sadaqa jariya à la Mosquée Sacrée.',
      longDescriptionHtml:
        "<p>Déposer un Coran à la Mosquée Sacrée pour vous, pour un défunt ou un proche est une Sadaqa Jariya.</p>" +
        "</br><p><strong>Vertus :</strong><br/>Chaque personne qui lira ou écoutera ce Coran vous apportera des récompenses continues. Acte noble, encore plus méritoire à La Mecque, où chaque bonne action est multipliée.</p>" +
        "</br><p><strong>Référence :</strong><br/>\"Une prière dans cette mosquée (la Mosquée Sacrée) est meilleure que 100 000 prières ailleurs.\" (Rapporté par Ahmad, Ibn Majah – authentifié par Al-Albani)</p>",
      image: '/images/coran.png',
      price: '19€',
      detailColorHex: '#000000',
      landingGradientClassName: "rounded-4xl bg-[linear-gradient(to_top,rgba(0,0,0,0.8)_8%,rgba(0,0,0,0)_60%)]",
      categoryId: categoryIds.SADAQA,
    },
  ];

  const all = [...offres, ...services, ...visa, ...sadaqa];
  return all.map((p, index) => ({
    ...p,
    slug: slugify(p.title),
    defaultCurrency: EUR,
    sortOrder: index,
  }));
}

async function upsertProductWithPrice(product) {
  const unitAmount = parsePriceToCents(product.price);
  const compareAtAmount = parsePriceToCents(product.firstPrice);
  const created = await prisma.product.upsert({
    where: { slug: product.slug },
    update: {
      name: product.title,
      description: product.description || null,
      categoryId: product.categoryId,
      pricingType: PricingType.FIXED,
      defaultCurrency: product.defaultCurrency,
      isPremium: product.isPremium ?? false,
      isHighlight: product.isHighlight ?? false,
      landingTitle: product.landingTitle ?? null,
      landingBio: product.landingBio ?? null,
      landingGradientClassName: product.landingGradientClassName ?? null,
      detailTitle: product.detailTitle ?? null,
      longDescriptionHtml: product.longDescriptionHtml || product.description || null,
      detailColorHex: product.detailColorHex ?? null,
      metadata: { 
        infoLabel: product.infoLabel ?? null,
        includedPeople: product.metadata?.includedPeople ?? null,
        extraPerPersonCents: product.metadata?.extraPerPersonCents ?? null,
      },
      active: true,
    },
    create: {
      slug: product.slug,
      name: product.title,
      description: product.description || null,
      categoryId: product.categoryId,
      pricingType: PricingType.FIXED,
      defaultCurrency: product.defaultCurrency,
      isPremium: product.isPremium ?? false,
      isHighlight: product.isHighlight ?? false,
      landingTitle: product.landingTitle ?? null,
      landingBio: product.landingBio ?? null,
      landingGradientClassName: product.landingGradientClassName ?? null,
      detailTitle: product.detailTitle ?? null,
      longDescriptionHtml: product.longDescriptionHtml || product.description || null,
      detailColorHex: product.detailColorHex ?? null,
      metadata: { 
        infoLabel: product.infoLabel ?? null,
        includedPeople: product.metadata?.includedPeople ?? null,
        extraPerPersonCents: product.metadata?.extraPerPersonCents ?? null,
      },
      images: product.image
        ? { create: [{ url: product.image, alt: product.title, sortOrder: 0 }] }
        : undefined,
      prices: {
        create: [
          {
            pricingType: PricingType.FIXED,
            currency: product.defaultCurrency,
            unitAmount: unitAmount,
            compareAtUnitAmount: compareAtAmount,
            active: true,
            isDefault: true,
          },
        ],
      },
    },
    include: { prices: true },
  });
  
  // Update existing prices with compareAtUnitAmount
  if (created.prices.length > 0) {
    await prisma.price.updateMany({
      where: { productId: created.id, isDefault: true },
      data: { compareAtUnitAmount: compareAtAmount },
    });
  }
  
  return created;
}

async function main() {
  console.log('Seeding database...');
  const categoryIds = await ensureCategories();
  const products = buildSeedData(categoryIds);

  for (const p of products) {
    await upsertProductWithPrice(p);
    process.stdout.write('.');
  }
  // Seed FAQ
  const faqs = [
    { question: 'How to use this component?', answer: 'To use this component, import it and render in your JSX.' },
    { question: 'Are there any other components available?', answer: "Yes, explore the Components section for more." },
    { question: 'Are components responsive?', answer: 'Yes, they are responsive for different screen sizes.' },
    { question: 'Can I customize the components?', answer: 'Yes, by passing props as documented.' },
  ];
  for (let i = 0; i < faqs.length; i++) {
    const f = faqs[i];
    await prisma.faqItem.upsert({
      where: { question: f.question },
      update: { answer: f.answer, sortOrder: i, isActive: true },
      create: { question: f.question, answer: f.answer, sortOrder: i, isActive: true },
    });
    process.stdout.write('F');
  }

  // Seed Testimonials
  const testimonials = [
    { 
      content: 'Salem aleykoum, baraka laoufik pour ton accompagnement pour réaliser cette omra, j\'avais beaucoup d\'appréhension notamment sur mon niveau de connaissance, les invocations à dire à chaque étapes et Al hamdoulilah tu m\'as bien guidé sur ce qu\'il fallait dire et tu m\'as beaucoup apporté sur la science et surtout tu as pu me rassurer… et donc le fait d\'avoir un guide m\'a permis de dissiper toute inquiétude et gêne, j\'ai pu poser toute les questions que je souhaitais.\n\nSi vous voulez réaliser cet acte d\'adoration avec une sérénité et une fluidité je vous le recommande baraka laoufik pour ton accompagnement que dieu te récompense akhy', 
      authorName: 'Papis', 
      authorRole: null, 
      avatarUrl: null 
    },
    { 
      content: 'Guide au top de part sa disponibilité, ses connaissances, et sa bonne compagnie, allahoumma baarik.\n\nNe serait-ce pour l\'accompagnant de la Omra, où la visite de certains lieux, je n\'ai rien à lui reprocher. Avec en plus de très bons conseils pour les trajets ou les autres petits endroits à visiter personnellement, je recommande les yeux fermés !\n\nQu\'Allah vous récompense.', 
      authorName: 'Nourdine B.', 
      authorRole: null, 
      avatarUrl: null 
    },
    { 
      content: 'Selem aleykoum\n\nj\'ai eu la chance de faire Omra incroyable avec mes parents le suivi rien a dire toujours a l\'écoute et réactif a toute demande je conseil les yeux fermer !\n\nQue Allah te récompense de tes bien fait et te facilite insha\'Allah !', 
      authorName: 'Djeriou Nabil', 
      authorRole: null, 
      avatarUrl: null 
    },
    { 
      content: 'Salem\n\nJe me permets de laisser un message de gratitude sur le compte professionnel wattsapp de visitmekkah\n\nTout d abord merci a l équipe pour cette Omra qui m as littéralement immergé au sein de ce merveilleux invitation que Allah notre créateur nous permet d effectuer par sa permission,j ai été mis a l aise ,les réponses à mes questions ont transformé mes angoisses en renforcement de foi,j en es effectué plusieurs,et plus j en fessait ,plus l envie de revenir étais forte ,ayant beaucoup voyagé dans le monde ,c est vraiment le voyage d une vie,que Allah me prête vie et m accorde une nouvelle invitation  ,merci beaucoup qu Allah illumine vos pas et vos coeur dans l oeuvre de bienveillance que vous donnez  lorsque nous arrivons en croyant avoir tout vu ,merci beaucoup a vous tous que Allah vous bénisse et qu IL accepte vos douas et votre Omra inchallah 🙏', 
      authorName: 'Mehdi L', 
      authorRole: null, 
      avatarUrl: null 
    },
  ];
  for (let i = 0; i < testimonials.length; i++) {
    const t = testimonials[i];
    await prisma.testimonial.upsert({
      where: { content: t.content },
      update: { authorName: t.authorName, authorRole: t.authorRole, avatarUrl: t.avatarUrl, sortOrder: i, isActive: true },
      create: { content: t.content, authorName: t.authorName, authorRole: t.authorRole, avatarUrl: t.avatarUrl, sortOrder: i, isActive: true },
    });
    process.stdout.write('T');
  }

  // Seed Gallery
  const galleryItems = [
    { type: 'image', title: 'Anurag Mishra', desc: 'Driven, innovative, visionary', url: '/photos/1.png', span: 'md:col-span-2 md:row-span-2 sm:col-span-1 sm:row-span-2' },
    { type: 'image', title: 'Dog Puppy', desc: 'Adorable loyal companion.', url: '/photos/2.png', span: 'md:col-span-4 md:row-span-2 col-span-1 sm:col-span-2 sm:row-span-2' },
    { type: 'image', title: 'Forest Path', desc: 'Mystical forest trail', url: '/photos/3.png', span: 'md:col-span-2 md:row-span-2 sm:col-span-2 sm:row-span-2 ' },
    { type: 'image', title: 'Falling Leaves', desc: 'Autumn scenery', url: '/photos/4.png', span: 'md:col-span-2 md:row-span-2 sm:col-span-1 sm:row-span-2 ' },
    { type: 'image', title: 'Bird Parrot', desc: 'Vibrant feathered charm', url: '/photos/5.png', span: 'md:col-span-2 md:row-span-2 sm:col-span-1 sm:row-span-2 ' },
    { type: 'image', title: 'Beach Paradise', desc: 'Sunny tropical beach', url: '/photos/6.png', span: 'md:col-span-2 md:row-span-2 sm:col-span-1 sm:row-span-2 ' },
    { type: 'image', title: 'Shiva Temple', desc: 'Peaceful Shiva sanctuary.', url: '/images/clocktower.png', span: 'md:col-span-2 md:row-span-4 sm:col-span-1 sm:row-span-4 ' },
    { type: 'image', title: 'Clock Tower', desc: 'Peaceful Shiva sanctuary.', url: '/photos/8.png', span: 'md:col-span-2 md:row-span-2 sm:col-span-1 sm:row-span-2 ' },
    { type: 'image', title: 'Shiva Temple', desc: 'Peaceful Shiva sanctuary.', url: '/photos/9.png', span: 'md:col-span-4 md:row-span-2 sm:col-span-1 sm:row-span-2 ' },
  ];
  for (let i = 0; i < galleryItems.length; i++) {
    const g = galleryItems[i];
    await prisma.galleryItem.upsert({
      where: { url: g.url },
      update: { title: g.title, desc: g.desc, type: g.type, span: g.span, sortOrder: i, isActive: true },
      create: { title: g.title, desc: g.desc, type: g.type, url: g.url, span: g.span, sortOrder: i, isActive: true },
    });
    process.stdout.write('G');
  }
  console.log('\nSeed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


