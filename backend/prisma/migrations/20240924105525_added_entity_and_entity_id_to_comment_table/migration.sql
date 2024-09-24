/*
  Warnings:

  - Added the required column `entity` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entityId` to the `Comment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `comment` DROP FOREIGN KEY `Comment_styleId_fkey`;

-- AlterTable
ALTER TABLE `comment` ADD COLUMN `entity` ENUM('STYLE', 'ITEM', 'COMMENT', 'BRAND', 'COLLECTION') NOT NULL,
    ADD COLUMN `entityId` VARCHAR(191) NOT NULL,
    MODIFY `styleId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
