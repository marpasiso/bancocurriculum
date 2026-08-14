-- DropIndex
DROP INDEX `AuditLog_userId_fkey` ON `auditlog`;

-- DropIndex
DROP INDEX `CandidateView_candidateId_fkey` ON `candidateview`;

-- DropIndex
DROP INDEX `CandidateView_employerId_fkey` ON `candidateview`;

-- DropIndex
DROP INDEX `ConsentSnapshot_candidateId_fkey` ON `consentsnapshot`;

-- DropIndex
DROP INDEX `Payment_employerId_fkey` ON `payment`;

-- DropIndex
DROP INDEX `Session_userId_fkey` ON `session`;

-- DropIndex
DROP INDEX `Subscription_employerId_fkey` ON `subscription`;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employer` ADD CONSTRAINT `Employer_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobFunction` ADD CONSTRAINT `JobFunction_employerId_fkey` FOREIGN KEY (`employerId`) REFERENCES `Employer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CandidateJobFunction` ADD CONSTRAINT `CandidateJobFunction_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `Candidate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CandidateJobFunction` ADD CONSTRAINT `CandidateJobFunction_jobFunctionId_fkey` FOREIGN KEY (`jobFunctionId`) REFERENCES `JobFunction`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE `CandidateInterestFunction` ADD CONSTRAINT `CandidateInterestFunction_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `Candidate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CandidateInterestFunction` ADD CONSTRAINT `CandidateInterestFunction_systemJobFunctionId_fkey` FOREIGN KEY (`systemJobFunctionId`) REFERENCES `SystemJobFunction`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

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
