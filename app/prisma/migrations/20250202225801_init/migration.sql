/*
  Warnings:

  - You are about to drop the `Brand` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BrandSubscription` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BrandVote` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Collection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CollectionVote` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Comment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FavoriteBrand` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FavoriteCollection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FavoriteStyle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Image` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Item` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Logo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Profile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Reset` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Style` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserSubscription` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_BrandTags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CollectionTags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CommentTags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ItemImage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ItemTags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_StyleItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_StyleTags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `favoriteItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Brand` DROP FOREIGN KEY `Brand_logoId_fkey`;

-- DropForeignKey
ALTER TABLE `Brand` DROP FOREIGN KEY `Brand_ownerId_fkey`;

-- DropForeignKey
ALTER TABLE `BrandSubscription` DROP FOREIGN KEY `BrandSubscription_brandId_fkey`;

-- DropForeignKey
ALTER TABLE `BrandSubscription` DROP FOREIGN KEY `BrandSubscription_userId_fkey`;

-- DropForeignKey
ALTER TABLE `BrandVote` DROP FOREIGN KEY `BrandVote_brandId_fkey`;

-- DropForeignKey
ALTER TABLE `BrandVote` DROP FOREIGN KEY `BrandVote_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Collection` DROP FOREIGN KEY `Collection_authorId_fkey`;

-- DropForeignKey
ALTER TABLE `CollectionVote` DROP FOREIGN KEY `CollectionVote_collectionId_fkey`;

-- DropForeignKey
ALTER TABLE `CollectionVote` DROP FOREIGN KEY `CollectionVote_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Comment` DROP FOREIGN KEY `Comment_authorId_fkey`;

-- DropForeignKey
ALTER TABLE `Comment` DROP FOREIGN KEY `Comment_parentId_fkey`;

-- DropForeignKey
ALTER TABLE `FavoriteBrand` DROP FOREIGN KEY `FavoriteBrand_brandId_fkey`;

-- DropForeignKey
ALTER TABLE `FavoriteBrand` DROP FOREIGN KEY `FavoriteBrand_userId_fkey`;

-- DropForeignKey
ALTER TABLE `FavoriteCollection` DROP FOREIGN KEY `FavoriteCollection_collectionId_fkey`;

-- DropForeignKey
ALTER TABLE `FavoriteCollection` DROP FOREIGN KEY `FavoriteCollection_userId_fkey`;

-- DropForeignKey
ALTER TABLE `FavoriteStyle` DROP FOREIGN KEY `FavoriteStyle_styleId_fkey`;

-- DropForeignKey
ALTER TABLE `FavoriteStyle` DROP FOREIGN KEY `FavoriteStyle_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Item` DROP FOREIGN KEY `Item_brandId_fkey`;

-- DropForeignKey
ALTER TABLE `Item` DROP FOREIGN KEY `Item_creatorId_fkey`;

-- DropForeignKey
ALTER TABLE `Logo` DROP FOREIGN KEY `Logo_imageId_fkey`;

-- DropForeignKey
ALTER TABLE `Profile` DROP FOREIGN KEY `Profile_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Reset` DROP FOREIGN KEY `Reset_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Style` DROP FOREIGN KEY `Style_authorId_fkey`;

-- DropForeignKey
ALTER TABLE `Style` DROP FOREIGN KEY `Style_collectionId_fkey`;

-- DropForeignKey
ALTER TABLE `UserSubscription` DROP FOREIGN KEY `UserSubscription_subscriberId_fkey`;

-- DropForeignKey
ALTER TABLE `UserSubscription` DROP FOREIGN KEY `UserSubscription_userId_fkey`;

-- DropForeignKey
ALTER TABLE `_BrandTags` DROP FOREIGN KEY `_BrandTags_A_fkey`;

-- DropForeignKey
ALTER TABLE `_BrandTags` DROP FOREIGN KEY `_BrandTags_B_fkey`;

-- DropForeignKey
ALTER TABLE `_CollectionTags` DROP FOREIGN KEY `_CollectionTags_A_fkey`;

-- DropForeignKey
ALTER TABLE `_CollectionTags` DROP FOREIGN KEY `_CollectionTags_B_fkey`;

-- DropForeignKey
ALTER TABLE `_CommentTags` DROP FOREIGN KEY `_CommentTags_A_fkey`;

-- DropForeignKey
ALTER TABLE `_CommentTags` DROP FOREIGN KEY `_CommentTags_B_fkey`;

-- DropForeignKey
ALTER TABLE `_ItemImage` DROP FOREIGN KEY `_ItemImage_A_fkey`;

-- DropForeignKey
ALTER TABLE `_ItemImage` DROP FOREIGN KEY `_ItemImage_B_fkey`;

-- DropForeignKey
ALTER TABLE `_ItemTags` DROP FOREIGN KEY `_ItemTags_A_fkey`;

-- DropForeignKey
ALTER TABLE `_ItemTags` DROP FOREIGN KEY `_ItemTags_B_fkey`;

-- DropForeignKey
ALTER TABLE `_StyleItem` DROP FOREIGN KEY `_StyleItem_A_fkey`;

-- DropForeignKey
ALTER TABLE `_StyleItem` DROP FOREIGN KEY `_StyleItem_B_fkey`;

-- DropForeignKey
ALTER TABLE `_StyleTags` DROP FOREIGN KEY `_StyleTags_A_fkey`;

-- DropForeignKey
ALTER TABLE `_StyleTags` DROP FOREIGN KEY `_StyleTags_B_fkey`;

-- DropForeignKey
ALTER TABLE `commentvote` DROP FOREIGN KEY `CommentVote_commentId_fkey`;

-- DropForeignKey
ALTER TABLE `commentvote` DROP FOREIGN KEY `CommentVote_userId_fkey`;

-- DropForeignKey
ALTER TABLE `favoriteItem` DROP FOREIGN KEY `favoriteItem_itemId_fkey`;

-- DropForeignKey
ALTER TABLE `favoriteItem` DROP FOREIGN KEY `favoriteItem_userId_fkey`;

-- DropForeignKey
ALTER TABLE `itemvote` DROP FOREIGN KEY `ItemVote_itemId_fkey`;

-- DropForeignKey
ALTER TABLE `itemvote` DROP FOREIGN KEY `ItemVote_userId_fkey`;

-- DropForeignKey
ALTER TABLE `stylevote` DROP FOREIGN KEY `StyleVote_styleId_fkey`;

-- DropForeignKey
ALTER TABLE `stylevote` DROP FOREIGN KEY `StyleVote_userId_fkey`;

-- DropTable
DROP TABLE `Brand`;

-- DropTable
DROP TABLE `BrandSubscription`;

-- DropTable
DROP TABLE `BrandVote`;

-- DropTable
DROP TABLE `Collection`;

-- DropTable
DROP TABLE `CollectionVote`;

-- DropTable
DROP TABLE `Comment`;

-- DropTable
DROP TABLE `FavoriteBrand`;

-- DropTable
DROP TABLE `FavoriteCollection`;

-- DropTable
DROP TABLE `FavoriteStyle`;

-- DropTable
DROP TABLE `Image`;

-- DropTable
DROP TABLE `Item`;

-- DropTable
DROP TABLE `Logo`;

-- DropTable
DROP TABLE `Profile`;

-- DropTable
DROP TABLE `Reset`;

-- DropTable
DROP TABLE `Style`;

-- DropTable
DROP TABLE `Tag`;

-- DropTable
DROP TABLE `User`;

-- DropTable
DROP TABLE `UserSubscription`;

-- DropTable
DROP TABLE `_BrandTags`;

-- DropTable
DROP TABLE `_CollectionTags`;

-- DropTable
DROP TABLE `_CommentTags`;

-- DropTable
DROP TABLE `_ItemImage`;

-- DropTable
DROP TABLE `_ItemTags`;

-- DropTable
DROP TABLE `_StyleItem`;

-- DropTable
DROP TABLE `_StyleTags`;

-- DropTable
DROP TABLE `favoriteItem`;

-- CreateTable
CREATE TABLE `brand` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `logoId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `ownerId` VARCHAR(191) NULL,

    UNIQUE INDEX `Brand_name_key`(`name`),
    UNIQUE INDEX `Brand_logoId_key`(`logoId`),
    INDEX `Brand_ownerId_fkey`(`ownerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `brandsubscription` (
    `id` VARCHAR(191) NOT NULL,
    `brandId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `BrandSubscription_userId_fkey`(`userId`),
    UNIQUE INDEX `BrandSubscription_brandId_userId_key`(`brandId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `brandvote` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `brandId` VARCHAR(191) NOT NULL,
    `vote` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `BrandVote_brandId_fkey`(`brandId`),
    UNIQUE INDEX `BrandVote_userId_brandId_key`(`userId`, `brandId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `collection` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `authorId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Collection_authorId_fkey`(`authorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `collectionvote` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `collectionId` VARCHAR(191) NOT NULL,
    `vote` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `CollectionVote_collectionId_fkey`(`collectionId`),
    UNIQUE INDEX `CollectionVote_userId_collectionId_key`(`userId`, `collectionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comment` (
    `id` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `entity` ENUM('STYLE', 'ITEM', 'COMMENT', 'BRAND', 'COLLECTION') NOT NULL,
    `entityId` VARCHAR(191) NOT NULL,
    `parentId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Comment_authorId_fkey`(`authorId`),
    INDEX `Comment_parentId_fkey`(`parentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `favoritebrand` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `brandId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `FavoriteBrand_brandId_fkey`(`brandId`),
    UNIQUE INDEX `FavoriteBrand_userId_brandId_key`(`userId`, `brandId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `favoritecollection` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `collectionId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `FavoriteCollection_collectionId_fkey`(`collectionId`),
    UNIQUE INDEX `FavoriteCollection_userId_collectionId_key`(`userId`, `collectionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `favoriteitem` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `itemId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `favoriteItem_itemId_fkey`(`itemId`),
    UNIQUE INDEX `favoriteItem_userId_itemId_key`(`userId`, `itemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `favoritestyle` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `styleId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `FavoriteStyle_styleId_fkey`(`styleId`),
    UNIQUE INDEX `FavoriteStyle_userId_styleId_key`(`userId`, `styleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `image` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `item` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `brandId` VARCHAR(191) NOT NULL,
    `creatorId` VARCHAR(191) NULL,

    INDEX `Item_brandId_fkey`(`brandId`),
    INDEX `Item_creatorId_fkey`(`creatorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `logo` (
    `id` VARCHAR(191) NOT NULL,
    `imageId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Logo_imageId_fkey`(`imageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `profile` (
    `id` VARCHAR(191) NOT NULL,
    `firstname` VARCHAR(191) NULL,
    `lastname` VARCHAR(191) NULL,
    `bio` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Profile_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reset` (
    `id` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Reset_token_key`(`token`),
    INDEX `Reset_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `style` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `authorId` VARCHAR(191) NULL,
    `collectionId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Style_authorId_fkey`(`authorId`),
    INDEX `Style_collectionId_fkey`(`collectionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tag` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Tag_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `social` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_name_key`(`name`),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usersubscription` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `subscriberId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `UserSubscription_subscriberId_fkey`(`subscriberId`),
    UNIQUE INDEX `UserSubscription_userId_subscriberId_key`(`userId`, `subscriberId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_brandtags` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_brandtags_AB_unique`(`A`, `B`),
    INDEX `_brandtags_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_collectiontags` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_collectiontags_AB_unique`(`A`, `B`),
    INDEX `_collectiontags_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_commenttags` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_commenttags_AB_unique`(`A`, `B`),
    INDEX `_commenttags_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_itemimage` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_itemimage_AB_unique`(`A`, `B`),
    INDEX `_itemimage_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_itemtags` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_itemtags_AB_unique`(`A`, `B`),
    INDEX `_itemtags_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_styleitem` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_styleitem_AB_unique`(`A`, `B`),
    INDEX `_styleitem_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_styletags` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_styletags_AB_unique`(`A`, `B`),
    INDEX `_styletags_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `brand` ADD CONSTRAINT `Brand_logoId_fkey` FOREIGN KEY (`logoId`) REFERENCES `logo`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `brand` ADD CONSTRAINT `Brand_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `brandsubscription` ADD CONSTRAINT `BrandSubscription_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `brand`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `brandsubscription` ADD CONSTRAINT `BrandSubscription_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `brandvote` ADD CONSTRAINT `BrandVote_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `brand`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `brandvote` ADD CONSTRAINT `BrandVote_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `collection` ADD CONSTRAINT `Collection_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `collectionvote` ADD CONSTRAINT `CollectionVote_collectionId_fkey` FOREIGN KEY (`collectionId`) REFERENCES `collection`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `collectionvote` ADD CONSTRAINT `CollectionVote_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comment` ADD CONSTRAINT `Comment_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comment` ADD CONSTRAINT `Comment_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `comment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commentvote` ADD CONSTRAINT `CommentVote_commentId_fkey` FOREIGN KEY (`commentId`) REFERENCES `comment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commentvote` ADD CONSTRAINT `CommentVote_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favoritebrand` ADD CONSTRAINT `FavoriteBrand_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `brand`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favoritebrand` ADD CONSTRAINT `FavoriteBrand_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favoritecollection` ADD CONSTRAINT `FavoriteCollection_collectionId_fkey` FOREIGN KEY (`collectionId`) REFERENCES `collection`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favoritecollection` ADD CONSTRAINT `FavoriteCollection_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favoriteitem` ADD CONSTRAINT `favoriteItem_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favoriteitem` ADD CONSTRAINT `favoriteItem_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favoritestyle` ADD CONSTRAINT `FavoriteStyle_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `style`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favoritestyle` ADD CONSTRAINT `FavoriteStyle_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `item` ADD CONSTRAINT `Item_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `brand`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `item` ADD CONSTRAINT `Item_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itemvote` ADD CONSTRAINT `ItemVote_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itemvote` ADD CONSTRAINT `ItemVote_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logo` ADD CONSTRAINT `Logo_imageId_fkey` FOREIGN KEY (`imageId`) REFERENCES `image`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `profile` ADD CONSTRAINT `Profile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reset` ADD CONSTRAINT `Reset_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `style` ADD CONSTRAINT `Style_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `style` ADD CONSTRAINT `Style_collectionId_fkey` FOREIGN KEY (`collectionId`) REFERENCES `collection`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stylevote` ADD CONSTRAINT `StyleVote_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `style`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stylevote` ADD CONSTRAINT `StyleVote_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usersubscription` ADD CONSTRAINT `UserSubscription_subscriberId_fkey` FOREIGN KEY (`subscriberId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usersubscription` ADD CONSTRAINT `UserSubscription_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_brandtags` ADD CONSTRAINT `_brandtags_A_fkey` FOREIGN KEY (`A`) REFERENCES `brand`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_brandtags` ADD CONSTRAINT `_brandtags_B_fkey` FOREIGN KEY (`B`) REFERENCES `tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_collectiontags` ADD CONSTRAINT `_collectiontags_A_fkey` FOREIGN KEY (`A`) REFERENCES `collection`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_collectiontags` ADD CONSTRAINT `_collectiontags_B_fkey` FOREIGN KEY (`B`) REFERENCES `tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_commenttags` ADD CONSTRAINT `_commenttags_A_fkey` FOREIGN KEY (`A`) REFERENCES `comment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_commenttags` ADD CONSTRAINT `_commenttags_B_fkey` FOREIGN KEY (`B`) REFERENCES `tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_itemimage` ADD CONSTRAINT `_itemimage_A_fkey` FOREIGN KEY (`A`) REFERENCES `image`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_itemimage` ADD CONSTRAINT `_itemimage_B_fkey` FOREIGN KEY (`B`) REFERENCES `item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_itemtags` ADD CONSTRAINT `_itemtags_A_fkey` FOREIGN KEY (`A`) REFERENCES `item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_itemtags` ADD CONSTRAINT `_itemtags_B_fkey` FOREIGN KEY (`B`) REFERENCES `tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_styleitem` ADD CONSTRAINT `_styleitem_A_fkey` FOREIGN KEY (`A`) REFERENCES `item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_styleitem` ADD CONSTRAINT `_styleitem_B_fkey` FOREIGN KEY (`B`) REFERENCES `style`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_styletags` ADD CONSTRAINT `_styletags_A_fkey` FOREIGN KEY (`A`) REFERENCES `style`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_styletags` ADD CONSTRAINT `_styletags_B_fkey` FOREIGN KEY (`B`) REFERENCES `tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
