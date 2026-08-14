-- AlterTable
ALTER TABLE `Candidate` ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX `Candidate_isActive_idx` ON `Candidate`(`isActive`);
