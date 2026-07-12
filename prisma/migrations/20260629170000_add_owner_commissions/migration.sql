ALTER TABLE `User`
  MODIFY `role` ENUM('ADMIN', 'EMPLOYER', 'SUPER_ADMIN', 'FINANCE_OWNER') NOT NULL;

CREATE TABLE `DeveloperCommission` (
  `id` VARCHAR(191) NOT NULL,
  `paymentId` VARCHAR(191) NOT NULL,
  `employerId` VARCHAR(191) NOT NULL,
  `grossAmount` DECIMAL(10, 2) NOT NULL,
  `commissionRate` DECIMAL(5, 2) NOT NULL,
  `commissionAmount` DECIMAL(10, 2) NOT NULL,
  `status` ENUM('PENDING', 'PAID', 'CANCELED') NOT NULL DEFAULT 'PENDING',
  `generatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `paidAt` DATETIME(3) NULL,
  `notes` TEXT NULL,

  UNIQUE INDEX `DeveloperCommission_paymentId_key`(`paymentId`),
  INDEX `DeveloperCommission_employerId_idx`(`employerId`),
  INDEX `DeveloperCommission_status_idx`(`status`),
  INDEX `DeveloperCommission_generatedAt_idx`(`generatedAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `DeveloperCommission`
  ADD CONSTRAINT `DeveloperCommission_paymentId_fkey`
  FOREIGN KEY (`paymentId`) REFERENCES `Payment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `DeveloperCommission`
  ADD CONSTRAINT `DeveloperCommission_employerId_fkey`
  FOREIGN KEY (`employerId`) REFERENCES `Employer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
