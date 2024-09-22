/*
  Warnings:

  - You are about to drop the `likestyle` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `likestyle` DROP FOREIGN KEY `LikeStyle_styleId_fkey`;

-- DropForeignKey
ALTER TABLE `likestyle` DROP FOREIGN KEY `LikeStyle_userId_fkey`;

-- AlterTable
ALTER TABLE `collection` ADD COLUMN `description` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `likestyle`;

-- CreateTable
CREATE TABLE `LikedStyle` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `styleId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `LikedStyle_userId_styleId_key`(`userId`, `styleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `LikedStyle` ADD CONSTRAINT `LikedStyle_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LikedStyle` ADD CONSTRAINT `LikedStyle_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
