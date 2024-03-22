-- CreateTable
CREATE TABLE `category_list` (
    `id` INTEGER NOT NULL,
    `category_id` VARCHAR(100) NOT NULL,
    `category_name` VARCHAR(100) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `category_list_category_id_key`(`category_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_category` (
    `id` INTEGER NOT NULL,
    `user_id` VARCHAR(100) NOT NULL,
    `category_id` VARCHAR(100) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,

    INDEX `user_category_user_id_idx`(`user_id`),
    INDEX `user_category_index`(`user_id`, `category_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_category` ADD CONSTRAINT `user_category_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `category_list`(`category_id`) ON DELETE CASCADE ON UPDATE CASCADE;
