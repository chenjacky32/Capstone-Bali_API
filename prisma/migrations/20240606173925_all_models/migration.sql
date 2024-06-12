/*
  Warnings:

  - You are about to drop the `detail_rating` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `detail_rating` DROP FOREIGN KEY `detail_rating_ibfk_1`;

-- DropForeignKey
ALTER TABLE `detail_rating` DROP FOREIGN KEY `detail_rating_ibfk_2`;

-- DropTable
DROP TABLE `detail_rating`;

-- CreateTable
CREATE TABLE `rating` (
    `rating_id` VARCHAR(10) NOT NULL,
    `rating` INTEGER NOT NULL,
    `user_id` VARCHAR(10) NOT NULL,
    `dest_id` VARCHAR(10) NOT NULL,

    INDEX `dest_id`(`dest_id`),
    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`rating_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bookmark_detail` (
    `id` VARCHAR(10) NOT NULL,
    `isBookmark` BOOLEAN NOT NULL,
    `user_id` VARCHAR(10) NOT NULL,
    `dest_id` VARCHAR(10) NOT NULL,

    INDEX `dest_id`(`dest_id`),
    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `rating` ADD CONSTRAINT `rating_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rating` ADD CONSTRAINT `rating_ibfk_2` FOREIGN KEY (`dest_id`) REFERENCES `destination`(`dest_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookmark_detail` ADD CONSTRAINT `bookmark_detail_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookmark_detail` ADD CONSTRAINT `bookmark_detail_ibfk_2` FOREIGN KEY (`dest_id`) REFERENCES `destination`(`dest_id`) ON DELETE CASCADE ON UPDATE CASCADE;
