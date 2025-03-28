/*
  Warnings:

  - The values [hotel,resort,hostel,apartment,camping,other] on the enum `AccommodationCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AccommodationCategory_new" AS ENUM ('โรงแรม', 'รีสอร์ท', 'โฮสเทล', 'อพาร์ทเมนท์', 'แคมป์ปิ้ง', 'อื่นๆ');
ALTER TABLE "AccommodationSpot" ALTER COLUMN "category" DROP DEFAULT;
ALTER TABLE "AccommodationSpot" ALTER COLUMN "category" TYPE "AccommodationCategory_new" USING ("category"::text::"AccommodationCategory_new");
ALTER TYPE "AccommodationCategory" RENAME TO "AccommodationCategory_old";
ALTER TYPE "AccommodationCategory_new" RENAME TO "AccommodationCategory";
DROP TYPE "AccommodationCategory_old";
ALTER TABLE "AccommodationSpot" ALTER COLUMN "category" SET DEFAULT 'โรงแรม';
COMMIT;

-- AlterTable
ALTER TABLE "AccommodationSpot" ALTER COLUMN "category" SET DEFAULT 'โรงแรม';
