-- DropForeignKey
ALTER TABLE `brandsubscription` DROP FOREIGN KEY `BrandSubscription_brandId_fkey`;

-- DropForeignKey
ALTER TABLE `item` DROP FOREIGN KEY `Item_creatorId_fkey`;

-- AddForeignKey
ALTER TABLE `BrandSubscription` ADD CONSTRAINT `BrandSubscription_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brand`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
