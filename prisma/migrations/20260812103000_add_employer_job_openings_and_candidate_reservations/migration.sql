-- CreateTable
CREATE TABLE `JobOpening` (
    `id` VARCHAR(191) NOT NULL,
    `employerId` VARCHAR(191) NOT NULL,
    `systemJobFunctionId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `requirements` TEXT NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `status` ENUM('OPEN', 'PAUSED', 'CLOSED', 'CANCELED') NOT NULL DEFAULT 'OPEN',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `JobOpening_employerId_idx`(`employerId`),
    INDEX `JobOpening_systemJobFunctionId_idx`(`systemJobFunctionId`),
    INDEX `JobOpening_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CandidateReservation` (
    `id` VARCHAR(191) NOT NULL,
    `candidateId` VARCHAR(191) NOT NULL,
    `employerId` VARCHAR(191) NOT NULL,
    `jobOpeningId` VARCHAR(191) NOT NULL,
    `status` ENUM('ACTIVE', 'CANCELED', 'HIRED') NOT NULL DEFAULT 'ACTIVE',
    `createdById` VARCHAR(191) NOT NULL,
    `canceledAt` DATETIME(3) NULL,
    `hiredAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CandidateReservation_candidateId_idx`(`candidateId`),
    INDEX `CandidateReservation_employerId_idx`(`employerId`),
    INDEX `CandidateReservation_jobOpeningId_idx`(`jobOpeningId`),
    INDEX `CandidateReservation_status_idx`(`status`),
    INDEX `CandidateReservation_createdById_idx`(`createdById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `JobOpening` ADD CONSTRAINT `JobOpening_employerId_fkey` FOREIGN KEY (`employerId`) REFERENCES `Employer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobOpening` ADD CONSTRAINT `JobOpening_systemJobFunctionId_fkey` FOREIGN KEY (`systemJobFunctionId`) REFERENCES `SystemJobFunction`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CandidateReservation` ADD CONSTRAINT `CandidateReservation_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `Candidate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CandidateReservation` ADD CONSTRAINT `CandidateReservation_employerId_fkey` FOREIGN KEY (`employerId`) REFERENCES `Employer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CandidateReservation` ADD CONSTRAINT `CandidateReservation_jobOpeningId_fkey` FOREIGN KEY (`jobOpeningId`) REFERENCES `JobOpening`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CandidateReservation` ADD CONSTRAINT `CandidateReservation_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
