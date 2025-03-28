-- AlterTable
ALTER TABLE "AccommodationSpot" ALTER COLUMN "category" SET DEFAULT 'hotel',
ALTER COLUMN "photos" DROP NOT NULL,
ALTER COLUMN "photos" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "TourismSpot" ALTER COLUMN "category" SET DEFAULT 'other',
ALTER COLUMN "photos" DROP NOT NULL,
ALTER COLUMN "photos" SET DATA TYPE TEXT;
