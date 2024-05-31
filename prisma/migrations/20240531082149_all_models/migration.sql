-- CreateTable
CREATE TABLE `destination` (
    `dest_id` VARCHAR(10) NOT NULL,
    `name_dest` VARCHAR(50) NOT NULL,
    `description` VARCHAR(50) NOT NULL,
    `img` VARCHAR(20) NOT NULL,
    `location` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`dest_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detail_rating` (
    `rating_id` INTEGER NOT NULL,
    `user_id` VARCHAR(10) NOT NULL,
    `dest_id` VARCHAR(10) NOT NULL,
    `rating` INTEGER NOT NULL,
    `bookmarks` BOOLEAN NOT NULL,

    INDEX `dest_id`(`dest_id`),
    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`rating_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `user_id` VARCHAR(10) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `email` VARCHAR(50) NOT NULL,
    `password` VARCHAR(64) NOT NULL,

    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `detail_rating` ADD CONSTRAINT `detail_rating_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_rating` ADD CONSTRAINT `detail_rating_ibfk_2` FOREIGN KEY (`dest_id`) REFERENCES `destination`(`dest_id`) ON DELETE CASCADE ON UPDATE CASCADE;
