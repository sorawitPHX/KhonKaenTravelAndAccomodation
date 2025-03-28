/*
  Warnings:

  - You are about to drop the column `phoneNumber` on the `TourismSpot` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `TourismSpot` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `TourismSpot` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TourismSpot" DROP COLUMN "phoneNumber",
DROP COLUMN "price",
DROP COLUMN "website";
