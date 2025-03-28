/*
  Warnings:

  - The values [natural,historical,cultural,shopping,entertainment,religious,other] on the enum `TourismCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TourismCategory_new" AS ENUM ('สวนสาธารณะ', 'พิพิธภัณฑ์', 'วัด', 'สวนน้ำ', 'สถานที่สักการะบูชา', 'คาเฟ่', 'สวนสัตว์', 'อนุสรณ์สถาน', 'อุทยานแห่งชาติ', 'อื่นๆ');
ALTER TABLE "TourismSpot" ALTER COLUMN "category" DROP DEFAULT;
ALTER TABLE "TourismSpot" ALTER COLUMN "category" TYPE "TourismCategory_new" USING ("category"::text::"TourismCategory_new");
ALTER TYPE "TourismCategory" RENAME TO "TourismCategory_old";
ALTER TYPE "TourismCategory_new" RENAME TO "TourismCategory";
DROP TYPE "TourismCategory_old";
ALTER TABLE "TourismSpot" ALTER COLUMN "category" SET DEFAULT 'อื่นๆ';
COMMIT;

-- AlterTable
ALTER TABLE "TourismSpot" ALTER COLUMN "category" SET DEFAULT 'อื่นๆ';
