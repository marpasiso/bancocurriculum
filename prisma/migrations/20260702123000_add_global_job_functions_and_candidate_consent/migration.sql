SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Candidate' AND COLUMN_NAME = 'consentAccepted') = 0,
  'ALTER TABLE `Candidate` ADD COLUMN `consentAccepted` BOOLEAN NOT NULL DEFAULT false',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Candidate' AND COLUMN_NAME = 'consentAcceptedAt') = 0,
  'ALTER TABLE `Candidate` ADD COLUMN `consentAcceptedAt` DATETIME(3) NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Candidate' AND COLUMN_NAME = 'consentTextVersion') = 0,
  'ALTER TABLE `Candidate` ADD COLUMN `consentTextVersion` VARCHAR(191) NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Candidate' AND COLUMN_NAME = 'consentTextSnapshot') = 0,
  'ALTER TABLE `Candidate` ADD COLUMN `consentTextSnapshot` TEXT NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Candidate' AND COLUMN_NAME = 'consentIp') = 0,
  'ALTER TABLE `Candidate` ADD COLUMN `consentIp` VARCHAR(191) NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Candidate' AND COLUMN_NAME = 'consentUserAgent') = 0,
  'ALTER TABLE `Candidate` ADD COLUMN `consentUserAgent` TEXT NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS `SystemJobFunction` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(58) NOT NULL,
  `description` TEXT NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `SystemJobFunction_name_key`(`name`),
  INDEX `SystemJobFunction_isActive_idx`(`isActive`),
  INDEX `SystemJobFunction_name_idx`(`name`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `CandidateInterestFunction` (
  `id` VARCHAR(191) NOT NULL,
  `candidateId` VARCHAR(191) NOT NULL,
  `systemJobFunctionId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `CandidateInterestFunction_candidateId_idx`(`candidateId`),
  INDEX `CandidateInterestFunction_systemJobFunctionId_idx`(`systemJobFunctionId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `CandidateInterestFunction`
  ADD CONSTRAINT `CandidateInterestFunction_candidateId_fkey`
  FOREIGN KEY (`candidateId`) REFERENCES `Candidate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `CandidateInterestFunction`
  ADD CONSTRAINT `CandidateInterestFunction_systemJobFunctionId_fkey`
  FOREIGN KEY (`systemJobFunctionId`) REFERENCES `SystemJobFunction`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT IGNORE INTO `SystemJobFunction` (`id`, `name`, `description`, `isActive`, `createdAt`, `updatedAt`) VALUES
  ('sys_job_auxiliar_administrativo', 'Auxiliar administrativo', 'Rotinas administrativas, organização de documentos e apoio ao atendimento.', true, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('sys_job_atendente', 'Atendente', 'Atendimento ao público, recepção e apoio em demandas operacionais.', true, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('sys_job_vendedor', 'Vendedor(a)', 'Atendimento comercial, vendas e relacionamento com clientes.', true, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('sys_job_servicos_gerais', 'Serviços gerais', 'Apoio em limpeza, organização e atividades gerais.', true, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('sys_job_cuidador', 'Cuidador(a)', 'Acompanhamento e cuidado de pessoas com responsabilidade e atenção.', true, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('sys_job_domestica', 'Doméstica', 'Serviços domésticos, organização e cuidado do ambiente residencial.', true, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('sys_job_motorista', 'Motorista', 'Condução de veículos e apoio em deslocamentos.', true, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('sys_job_cozinheiro', 'Cozinheiro(a)', 'Preparo de alimentos, organização de cozinha e apoio em rotina alimentar.', true, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3));
