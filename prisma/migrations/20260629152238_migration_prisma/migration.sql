-- DropIndex
DROP INDEX `AuditLog_userId_idx` ON `auditlog`;

-- DropIndex
DROP INDEX `CandidateView_candidateId_idx` ON `candidateview`;

-- DropIndex
DROP INDEX `CandidateView_employerId_idx` ON `candidateview`;

-- DropIndex
DROP INDEX `ConsentSnapshot_candidateId_idx` ON `consentsnapshot`;

-- DropIndex
DROP INDEX `Payment_employerId_idx` ON `payment`;

-- DropIndex
DROP INDEX `Session_userId_idx` ON `session`;

-- DropIndex
DROP INDEX `Subscription_employerId_idx` ON `subscription`;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employer` ADD CONSTRAINT `Employer_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConsentSnapshot` ADD CONSTRAINT `ConsentSnapshot_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `Candidate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_employerId_fkey` FOREIGN KEY (`employerId`) REFERENCES `Employer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subscription` ADD CONSTRAINT `Subscription_employerId_fkey` FOREIGN KEY (`employerId`) REFERENCES `Employer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CandidateView` ADD CONSTRAINT `CandidateView_employerId_fkey` FOREIGN KEY (`employerId`) REFERENCES `Employer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CandidateView` ADD CONSTRAINT `CandidateView_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `Candidate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
