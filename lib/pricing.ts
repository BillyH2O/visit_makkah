/**
 * Calcule le prix dynamique selon le nombre de personnes
 * Logique : prix fixe de 1 à X personnes, puis + Y€ par personne supplémentaire
 * 
 * @example
 * // Exemple : 700€ pour 1-3 personnes, puis +100€ par personne supplémentaire
 * // - 1, 2 ou 3 personnes : 700€
 * // - 4 personnes : 700€ + 100€ = 800€
 * // - 5 personnes : 700€ + 200€ = 900€
 * 
 * @param basePriceEuro - Prix de base en euros (peut être null)
 * @param peopleCount - Nombre de personnes (peut être undefined)
 * @param includedPeople - Nombre de personnes incluses dans le prix fixe (0 = pas de seuil)
 * @param extraPerPersonCents - Montant supplémentaire par personne en centimes
 * @returns Prix calculé en euros ou null si basePriceEuro est null
 */
export function calculatePrice(
  basePriceEuro: number | null,
  peopleCount: number | undefined,
  includedPeople: number = 0,
  extraPerPersonCents: number = 0
): number | null {
  if (basePriceEuro == null) return null
  if (!peopleCount || peopleCount < 1) return basePriceEuro
  
  // Si pas de seuil défini (includedPeople === 0) : multiplier le prix par le nombre de personnes
  // C'est le cas pour SADAQA et certains services
  if (includedPeople === 0) {
    return basePriceEuro * peopleCount
  }
  
  // Si nombre <= seuil : prix fixe
  if (peopleCount <= includedPeople) {
    return basePriceEuro
  }
  
  // Au-delà du seuil : prix fixe + supplément par personne supplémentaire
  const extraPeople = peopleCount - includedPeople
  const extraAmountEuro = (extraPerPersonCents * extraPeople) / 100
  return basePriceEuro + extraAmountEuro
}

/**
 * Calcule le montant total en centimes pour la facturation (API)
 * Logique : prix fixe de 1 à X personnes, puis + Y€ par personne supplémentaire
 * 
 * @param baseUnitAmountCents - Prix de base en centimes
 * @param groupSize - Nombre de personnes
 * @param quantity - Quantité de produits
 * @param includedPeople - Nombre de personnes incluses dans le prix fixe (0 = pas de seuil)
 * @param extraPerPersonCents - Montant supplémentaire par personne en centimes
 * @returns Objet avec baseAmount et extraAmount en centimes
 */
export function calculateOrderAmounts(
  baseUnitAmountCents: number,
  groupSize: number,
  quantity: number,
  includedPeople: number = 0,
  extraPerPersonCents: number = 0
): { baseAmount: number; extraAmount: number; baseUnits: number; extraUnits: number } {
  // Calcul des unités pour la facturation
  let baseUnits = 1
  let extraUnits = 0
  
  let baseAmount = 0
  let extraAmount = 0
  
  // Si pas de seuil défini (includedPeople === 0) : multiplier le prix par le nombre de personnes/véhicules
  // C'est le cas pour SADAQA et certains services comme les transports
  if (includedPeople === 0) {
    // Pour les transports, chaque véhicule est une unité
    baseUnits = groupSize
    baseAmount = baseUnitAmountCents * groupSize * quantity
    extraAmount = 0
  } else if (groupSize <= includedPeople) {
    // Si nombre <= seuil : prix fixe
    baseUnits = 1
    baseAmount = baseUnitAmountCents * quantity
    extraAmount = 0
  } else {
    // Au-delà du seuil : prix fixe + supplément par personne supplémentaire
    baseUnits = 1
    extraUnits = groupSize - includedPeople
    baseAmount = baseUnitAmountCents * quantity
    extraAmount = extraPerPersonCents * extraUnits * quantity
  }
  
  return { baseAmount, extraAmount, baseUnits, extraUnits }
}

