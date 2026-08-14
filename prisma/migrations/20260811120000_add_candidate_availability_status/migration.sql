ALTER TABLE `Candidate`
  ADD COLUMN `availabilityStatus` ENUM('AVAILABLE', 'IN_PROCESS', 'HIRED', 'UNAVAILABLE') NOT NULL DEFAULT 'AVAILABLE';

UPDATE `Candidate`
SET `availabilityStatus` = 'UNAVAILABLE'
WHERE `isActive` = false;

CREATE INDEX `Candidate_availabilityStatus_idx` ON `Candidate`(`availabilityStatus`);
