/*
  Warnings:

  - You are about to drop the column `geom` on the `AccommodationSpot` table. All the data in the column will be lost.
  - You are about to drop the column `geom` on the `TourismSpot` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AccommodationSpot" DROP COLUMN "geom";

-- AlterTable
ALTER TABLE "TourismSpot" DROP COLUMN "geom";
