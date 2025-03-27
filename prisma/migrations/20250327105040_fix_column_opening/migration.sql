-- AlterTable
ALTER TABLE "AccommodationSpot" ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "openingHours" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "TourismSpot" ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "openingHours" SET DATA TYPE TEXT;
