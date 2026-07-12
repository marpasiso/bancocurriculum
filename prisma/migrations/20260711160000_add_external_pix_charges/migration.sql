CREATE TABLE `ExternalPixCharge` (
  `id` VARCHAR(191) NOT NULL,
  `provider` VARCHAR(191) NOT NULL,
  `purpose` VARCHAR(191) NOT NULL,
  `merchantChargeId` VARCHAR(191) NOT NULL,
  `providerChargeId` VARCHAR(191) NULL,
  `amountCents` INTEGER NOT NULL,
  `status` ENUM('PENDING', 'PAID', 'CANCELED', 'EXPIRED', 'ERROR') NOT NULL DEFAULT 'PENDING',
  `qrCode` TEXT NOT NULL,
  `confirmationMode` VARCHAR(191) NULL,
  `paidAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `ExternalPixCharge_merchantChargeId_key`(`merchantChargeId`),
  INDEX `ExternalPixCharge_provider_purpose_status_idx`(`provider`, `purpose`, `status`),
  INDEX `ExternalPixCharge_createdAt_idx`(`createdAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
