-- DropForeignKey
ALTER TABLE `brand` DROP FOREIGN KEY `Brand_logoId_fkey`;

-- AlterTable
ALTER TABLE `brand` MODIFY `logoId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Brand` ADD CONSTRAINT `Brand_logoId_fkey` FOREIGN KEY (`logoId`) REFERENCES `Logo`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
