import { prisma } from "@/lib/prisma";
import { recordAuditLog } from "@/modules/audit-log-skill/service";
import { requireOperationalAdminUser, requireSuperAdminUser } from "@/modules/security-skill/permissions";
import { z } from "zod";

const settingKeys = [
  "pix_key",
  "pix_receiver_name",
  "pix_receiver_city",
  "default_payment_amount",
  "operational_commission_rate",
  "operational_pix_key",
  "operational_pix_receiver_name",
  "operational_pix_receiver_city",
  "maintenance_plan_name",
  "maintenance_plan_type",
  "maintenance_plan_value",
  "maintenance_plan_due_date",
  "maintenance_plan_status",
  "maintenance_plan_notes",
  "platform_name",
  "platform_description",
  "theme_mode",
  "reduce_blue_light",
  "font_size",
  "readable_text",
  "high_contrast"
] as const;

const DEFAULT_SUBSCRIPTION_AMOUNT = "99.00";
const DEFAULT_COMMISSION_RATE = "10.00";
const LEGACY_PLATFORM_NAME = "Banco de Curriculos";
const LEGACY_INTERMEDIATE_PLATFORM_NAME = "Talentos Locais";
const LEGACY_PLATFORM_DESCRIPTION = "Plataforma local de recrutamento com cadastro LGPD e acesso controlado para empregadores.";

type SettingKey = (typeof settingKeys)[number];

export type OperationalSettings = {
  platformName: string;
  platformDescription: string;
  fontSize: "normal" | "large" | "extra";
  readableText: boolean;
  highContrast: boolean;
};

export type FinancialSettings = {
  subscriptionPixKey: string;
  subscriptionPixReceiverName: string;
  subscriptionPixReceiverCity: string;
  subscriptionPaymentAmount: string;
  operationalCommissionRate: string;
  operationalPixKey: string;
  operationalPixReceiverName: string;
  operationalPixReceiverCity: string;
  maintenancePlanName: string;
  maintenancePlanType: "MONTHLY" | "ANNUAL";
  maintenancePlanValue: string;
  maintenancePlanDueDate: string;
  maintenancePlanStatus: "ACTIVE" | "PENDING" | "OVERDUE" | "CANCELED" | "EXEMPT";
  maintenancePlanNotes: string;
};

const settingTypeByKey: Record<SettingKey, string> = {
  pix_key: "string",
  pix_receiver_name: "string",
  pix_receiver_city: "string",
  default_payment_amount: "decimal",
  operational_commission_rate: "decimal",
  operational_pix_key: "string",
  operational_pix_receiver_name: "string",
  operational_pix_receiver_city: "string",
  maintenance_plan_name: "string",
  maintenance_plan_type: "string",
  maintenance_plan_value: "decimal",
  maintenance_plan_due_date: "string",
  maintenance_plan_status: "string",
  maintenance_plan_notes: "text",
  platform_name: "string",
  platform_description: "text",
  theme_mode: "string",
  reduce_blue_light: "boolean",
  font_size: "string",
  readable_text: "boolean",
  high_contrast: "boolean"
};

const defaultSettings: Record<SettingKey, string> = {
  pix_key: "",
  pix_receiver_name: "",
  pix_receiver_city: "",
  default_payment_amount: DEFAULT_SUBSCRIPTION_AMOUNT,
  operational_commission_rate: DEFAULT_COMMISSION_RATE,
  operational_pix_key: "",
  operational_pix_receiver_name: "",
  operational_pix_receiver_city: "",
  platform_name: "Janaina Pinheiro Treinamentos",
  platform_description: "Banco de Pessoas para Oportunidades de Trabalho",
  theme_mode: "light",
  reduce_blue_light: "false",
  font_size: "normal",
  readable_text: "false",
  maintenance_plan_name: "Plano de manutenção do sistema",
  maintenance_plan_type: "MONTHLY",
  maintenance_plan_value: "0.00",
  maintenance_plan_due_date: "",
  maintenance_plan_status: "PENDING",
  maintenance_plan_notes: "",
  high_contrast: "false"
};

export const operationalSettingsSchema = z.object({
  platformName: z.string().trim().min(2).max(80),
  platformDescription: z.string().trim().min(10).max(240),
  fontSize: z.enum(["normal", "large", "extra"]),
  readableText: z.boolean(),
  highContrast: z.boolean()
});

export const subscriptionPaymentSettingsSchema = z.object({
  subscriptionPixKey: z.string().trim().min(3, "Informe uma chave Pix valida.").max(120),
  subscriptionPixReceiverName: z.string().trim().min(2, "Informe o nome do recebedor.").max(25),
  subscriptionPixReceiverCity: z.string().trim().min(2, "Informe a cidade do recebedor.").max(25),
  subscriptionPaymentAmount: z
    .string()
    .trim()
    .regex(/^\d+([,.]\d{1,2})?$/, "Informe um valor em reais valido.")
    .transform((value) => Number(value.replace(",", ".")).toFixed(2))
    .refine((value) => Number(value) > 0, "Informe um valor maior que zero.")
});

export const operationalRepasseSettingsSchema = z.object({
  maintenancePlanName: z.string().trim().min(2, "Informe o nome do plano.").max(80),
  maintenancePlanType: z.enum(["MONTHLY", "ANNUAL"]),
  maintenancePlanValue: z
    .string()
    .trim()
    .regex(/^\d+([,.]\d{1,2})?$/, "Informe um valor em reais válido.")
    .transform((value) => Number(value.replace(",", ".")).toFixed(2))
    .refine((value) => Number(value) >= 0, "Informe um valor igual ou maior que zero."),
  maintenancePlanDueDate: z.string().trim().optional().default(""),
  maintenancePlanStatus: z.enum(["ACTIVE", "PENDING", "OVERDUE", "CANCELED", "EXEMPT"]),
  maintenancePlanNotes: z.string().trim().max(500).optional().default(""),
  operationalPixKey: z.string().trim().min(3, "Informe uma chave Pix valida.").max(120),
  operationalPixReceiverName: z.string().trim().min(2, "Informe o nome do recebedor.").max(25),
  operationalPixReceiverCity: z.string().trim().min(2, "Informe a cidade do recebedor.").max(25)
});

function toPublicSettings(values: Record<SettingKey, string>): OperationalSettings {
  const isLegacyPlatformName = values.platform_name === LEGACY_PLATFORM_NAME || values.platform_name === LEGACY_INTERMEDIATE_PLATFORM_NAME;

  return {
    platformName: isLegacyPlatformName ? defaultSettings.platform_name : values.platform_name,
    platformDescription: values.platform_description === LEGACY_PLATFORM_DESCRIPTION ? defaultSettings.platform_description : values.platform_description,
    fontSize: values.font_size === "large" || values.font_size === "extra" ? values.font_size : "normal",
    readableText: values.readable_text === "true",
    highContrast: values.high_contrast === "true"
  };
}

function toFinancialSettings(values: Record<SettingKey, string>): FinancialSettings {
  return {
    subscriptionPixKey: values.pix_key,
    subscriptionPixReceiverName: values.pix_receiver_name,
    subscriptionPixReceiverCity: values.pix_receiver_city,
    subscriptionPaymentAmount: values.default_payment_amount,
    operationalCommissionRate: values.operational_commission_rate,
    operationalPixKey: values.operational_pix_key,
    operationalPixReceiverName: values.operational_pix_receiver_name,
    operationalPixReceiverCity: values.operational_pix_receiver_city,
    maintenancePlanName: values.maintenance_plan_name,
    maintenancePlanType: values.maintenance_plan_type === "ANNUAL" ? "ANNUAL" : "MONTHLY",
    maintenancePlanValue: values.maintenance_plan_value,
    maintenancePlanDueDate: values.maintenance_plan_due_date,
    maintenancePlanStatus: ["ACTIVE", "PENDING", "OVERDUE", "CANCELED", "EXEMPT"].includes(values.maintenance_plan_status)
      ? values.maintenance_plan_status as FinancialSettings["maintenancePlanStatus"]
      : "PENDING",
    maintenancePlanNotes: values.maintenance_plan_notes
  };
}

function toSettingMap(input: OperationalSettings): Record<SettingKey, string> {
  return {
    ...defaultSettings,
    platform_name: input.platformName,
    platform_description: input.platformDescription,
    font_size: input.fontSize,
    readable_text: String(input.readableText),
    high_contrast: String(input.highContrast)
  };
}

function subscriptionPaymentToSettingMap(input: z.infer<typeof subscriptionPaymentSettingsSchema>): Partial<Record<SettingKey, string>> {
  return {
    pix_key: input.subscriptionPixKey,
    pix_receiver_name: input.subscriptionPixReceiverName,
    pix_receiver_city: input.subscriptionPixReceiverCity,
    default_payment_amount: input.subscriptionPaymentAmount
  };
}

function operationalRepasseToSettingMap(input: z.infer<typeof operationalRepasseSettingsSchema>): Partial<Record<SettingKey, string>> {
  return {
    maintenance_plan_name: input.maintenancePlanName,
    maintenance_plan_type: input.maintenancePlanType,
    maintenance_plan_value: input.maintenancePlanValue,
    maintenance_plan_due_date: input.maintenancePlanDueDate,
    maintenance_plan_status: input.maintenancePlanStatus,
    maintenance_plan_notes: input.maintenancePlanNotes,
    operational_pix_key: input.operationalPixKey,
    operational_pix_receiver_name: input.operationalPixReceiverName,
    operational_pix_receiver_city: input.operationalPixReceiverCity
  };
}

export function hasSubscriptionPixSettings(settings: FinancialSettings) {
  return Boolean(settings.subscriptionPixKey && settings.subscriptionPixReceiverName && settings.subscriptionPixReceiverCity);
}

export function hasOperationalRepassePixSettings(settings: FinancialSettings) {
  return Boolean(settings.operationalPixKey && settings.operationalPixReceiverName && settings.operationalPixReceiverCity);
}

export function hasPixSettings(settings: FinancialSettings) {
  return hasSubscriptionPixSettings(settings);
}

function amountStringToCents(value: string) {
  return Math.round(Number(value.replace(",", ".")) * 100);
}

async function getSettingsMap() {
  const rows = await prisma.systemSetting.findMany({
    where: { key: { in: [...settingKeys] } }
  });
  const values = { ...defaultSettings };

  for (const row of rows) {
    if (settingKeys.includes(row.key as SettingKey)) {
      values[row.key as SettingKey] = row.value;
    }
  }

  return values;
}

async function upsertSettings(actorUserId: string, next: Partial<Record<SettingKey, string>>, auditAction = "SETTINGS_UPDATED") {
  const current = await getSettingsMap();
  const changedFields = Object.keys(next).filter((key) => current[key as SettingKey] !== next[key as SettingKey]) as SettingKey[];

  for (const key of Object.keys(next) as SettingKey[]) {
    await prisma.systemSetting.upsert({
      where: { key },
      update: {
        value: next[key] ?? defaultSettings[key],
        type: settingTypeByKey[key],
        updatedBy: actorUserId
      },
      create: {
        key,
        value: next[key] ?? defaultSettings[key],
        type: settingTypeByKey[key],
        updatedBy: actorUserId
      }
    });
  }

  if (changedFields.length > 0) {
    await recordAuditLog({
      userId: actorUserId,
      action: auditAction,
      entity: "SystemSetting",
      metadata: { changedFields }
    });
  }

  return changedFields;
}

export async function getOperationalSettings() {
  return toPublicSettings(await getSettingsMap());
}

export async function getFinancialSettings() {
  return toFinancialSettings(await getSettingsMap());
}

export async function getSubscriptionPaymentAmountCents() {
  const settings = await getFinancialSettings();
  return amountStringToCents(settings.subscriptionPaymentAmount);
}

export async function getOperationalCommissionRate() {
  const settings = await getFinancialSettings();
  return Number(settings.operationalCommissionRate);
}

export async function saveOperationalSettings(actorUserId: string, input: unknown) {
  await requireSuperAdminUser();
  const parsed = operationalSettingsSchema.parse(input);
  const next = toSettingMap(parsed);
  await upsertSettings(actorUserId, {
    platform_name: next.platform_name,
    platform_description: next.platform_description,
    font_size: next.font_size,
    readable_text: next.readable_text,
    high_contrast: next.high_contrast
  });

  return getOperationalSettings();
}

export async function saveSubscriptionPaymentSettings(actorUserId: string, input: unknown) {
  await requireOperationalAdminUser();
  const parsed = subscriptionPaymentSettingsSchema.parse(input);
  const next = subscriptionPaymentToSettingMap(parsed);
  const changedFields = await upsertSettings(actorUserId, next, "PIX_SETTINGS_UPDATED");

  if (changedFields.length > 0) {
    await recordAuditLog({
      userId: actorUserId,
      action: "SUBSCRIPTION_PAYMENT_SETTINGS_UPDATED",
      entity: "SystemSetting",
      metadata: { changedFields }
    });
  }

  return getFinancialSettings();
}

export async function saveOperationalRepasseSettings(actorUserId: string, input: unknown) {
  await requireSuperAdminUser();
  const parsed = operationalRepasseSettingsSchema.parse(input);
  const next = operationalRepasseToSettingMap(parsed);
  const changedFields = await upsertSettings(actorUserId, next, "OPERATIONAL_REPASSE_SETTINGS_UPDATED");

  return getFinancialSettings();
}
