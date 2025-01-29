/*
  Warnings:

  - You are about to alter the column `vote` on the `commentvote` table. The data in that column could be lost. The data in that column will be cast from `Int` to `TinyInt`.
  - You are about to alter the column `vote` on the `stylevote` table. The data in that column could be lost. The data in that column will be cast from `Int` to `TinyInt`.

*/
-- AlterTable
ALTER TABLE `commentvote` MODIFY `vote` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `stylevote` MODIFY `vote` BOOLEAN NOT NULL DEFAULT true;
