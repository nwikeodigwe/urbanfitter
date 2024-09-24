/*
  Warnings:

  - You are about to drop the column `styleId` on the `comment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `comment` DROP FOREIGN KEY `Comment_styleId_fkey`;

-- AlterTable
ALTER TABLE `comment` DROP COLUMN `styleId`;
