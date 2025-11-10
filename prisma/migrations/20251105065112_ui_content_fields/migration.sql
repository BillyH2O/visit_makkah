-- AlterTable
ALTER TABLE "Price" ADD COLUMN     "compareAtUnitAmount" INTEGER;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "detailColorHex" TEXT,
ADD COLUMN     "detailTitle" TEXT,
ADD COLUMN     "landingBio" TEXT,
ADD COLUMN     "landingGradientClassName" TEXT,
ADD COLUMN     "landingTitle" TEXT,
ADD COLUMN     "longDescriptionHtml" TEXT;
