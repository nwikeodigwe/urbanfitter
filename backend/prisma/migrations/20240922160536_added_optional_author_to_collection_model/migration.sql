-- DropForeignKey
ALTER TABLE `comment` DROP FOREIGN KEY `Comment_styleId_fkey`;

-- AlterTable
ALTER TABLE `collection` ADD COLUMN `authorId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `item` ADD COLUMN `description` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Collection` ADD CONSTRAINT `Collection_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
