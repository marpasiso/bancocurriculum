-- CreateTable
CREATE TABLE IF NOT EXISTS `JobFunction` (
    `id` VARCHAR(191) NOT NULL,
    `employerId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(58) NOT NULL,
    `description` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `JobFunction_isActive_idx`(`isActive`),
    INDEX `JobFunction_name_idx`(`name`),
    UNIQUE INDEX `JobFunction_employerId_name_key`(`employerId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `CandidateJobFunction` (
    `id` VARCHAR(191) NOT NULL,
    `candidateId` VARCHAR(191) NOT NULL,
    `jobFunctionId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `CandidateJobFunction_candidateId_idx`(`candidateId`),
    INDEX `CandidateJobFunction_jobFunctionId_idx`(`jobFunctionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `JobFunction` ADD CONSTRAINT `JobFunction_employerId_fkey` FOREIGN KEY (`employerId`) REFERENCES `Employer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CandidateJobFunction` ADD CONSTRAINT `CandidateJobFunction_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `Candidate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CandidateJobFunction` ADD CONSTRAINT `CandidateJobFunction_jobFunctionId_fkey` FOREIGN KEY (`jobFunctionId`) REFERENCES `JobFunction`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
