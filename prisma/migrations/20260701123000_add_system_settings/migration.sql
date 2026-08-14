CREATE TABLE `SystemSetting` (
  `id` VARCHAR(191) NOT NULL,
  `key` VARCHAR(191) NOT NULL,
  `value` TEXT NOT NULL,
  `type` VARCHAR(191) NOT NULL,
  `updatedBy` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `SystemSetting_key_key`(`key`),
  INDEX `SystemSetting_key_idx`(`key`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `SystemSetting` (`id`, `key`, `value`, `type`, `createdAt`, `updatedAt`)
VALUES
  (CONCAT('set_', REPLACE(UUID(), '-', '')), 'pix_key', '', 'string', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (CONCAT('set_', REPLACE(UUID(), '-', '')), 'pix_receiver_name', '', 'string', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (CONCAT('set_', REPLACE(UUID(), '-', '')), 'pix_receiver_city', '', 'string', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (CONCAT('set_', REPLACE(UUID(), '-', '')), 'default_payment_amount', '99.00', 'decimal', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (CONCAT('set_', REPLACE(UUID(), '-', '')), 'platform_name', 'Banco de Curriculos', 'string', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (CONCAT('set_', REPLACE(UUID(), '-', '')), 'platform_description', 'Plataforma local de recrutamento com cadastro LGPD e acesso controlado para empregadores.', 'text', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3));
