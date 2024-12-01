-- DropForeignKey
ALTER TABLE `usersubscription` DROP FOREIGN KEY `UserSubscription_subscriberId_fkey`;

-- AddForeignKey
ALTER TABLE `UserSubscription` ADD CONSTRAINT `UserSubscription_subscriberId_fkey` FOREIGN KEY (`subscriberId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
