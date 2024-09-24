/*
  Warnings:

  - You are about to drop the `likedcollection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `likedcomment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `likeditem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `likedstyle` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `likedcollection` DROP FOREIGN KEY `LikedCollection_collectionId_fkey`;

-- DropForeignKey
ALTER TABLE `likedcollection` DROP FOREIGN KEY `LikedCollection_userId_fkey`;

-- DropForeignKey
ALTER TABLE `likedcomment` DROP FOREIGN KEY `LikedComment_commentId_fkey`;

-- DropForeignKey
ALTER TABLE `likedcomment` DROP FOREIGN KEY `LikedComment_userId_fkey`;

-- DropForeignKey
ALTER TABLE `likeditem` DROP FOREIGN KEY `LikedItem_itemId_fkey`;

-- DropForeignKey
ALTER TABLE `likeditem` DROP FOREIGN KEY `LikedItem_userId_fkey`;

-- DropForeignKey
ALTER TABLE `likedstyle` DROP FOREIGN KEY `LikedStyle_styleId_fkey`;

-- DropForeignKey
ALTER TABLE `likedstyle` DROP FOREIGN KEY `LikedStyle_userId_fkey`;

-- DropTable
DROP TABLE `likedcollection`;

-- DropTable
DROP TABLE `likedcomment`;

-- DropTable
DROP TABLE `likeditem`;

-- DropTable
DROP TABLE `likedstyle`;

-- CreateTable
CREATE TABLE `FavoriteBrand` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `brandId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `FavoriteBrand_userId_brandId_key`(`userId`, `brandId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FavoriteCollection` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `collectionId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `FavoriteCollection_userId_collectionId_key`(`userId`, `collectionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FavoriteStyle` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `styleId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `FavoriteStyle_userId_styleId_key`(`userId`, `styleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FavoriteBrand` ADD CONSTRAINT `FavoriteBrand_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FavoriteBrand` ADD CONSTRAINT `FavoriteBrand_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brand`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FavoriteCollection` ADD CONSTRAINT `FavoriteCollection_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FavoriteCollection` ADD CONSTRAINT `FavoriteCollection_collectionId_fkey` FOREIGN KEY (`collectionId`) REFERENCES `Collection`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FavoriteStyle` ADD CONSTRAINT `FavoriteStyle_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FavoriteStyle` ADD CONSTRAINT `FavoriteStyle_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
