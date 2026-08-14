import { prisma } from "@/lib/prisma";
import { recordAuditLog } from "@/modules/audit-log-skill/service";
import { requireOperationalAdminUser, requireSuperAdminUser } from "@/modules/security-skill/permissions";
import { z } from "zod";

const settingKeys = [
  "pix_key",
  "pix_receiver_name",
  "pix_receiver_city",
  "default_payment_amount",
  "platform_name",
  "platform_description",
  "theme_mode",
  "reduce_blue_light",
  "font_size",
  "readable_text",
  "high_contrast"
] as const;

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
};

const settingTypeByKey: Record<SettingKey, string> = {
  pix_key: "string",
  pix_receiver_name: "string",
  pix_receiver_city: "string",
  default_payment_amount: "decimal",
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
  default_payment_amount: "",
  platform_name: "Janaina Pinheiro Treinamentos",
  platform_description: "Banco de Pessoas para Oportunidades de Trabalho",
  theme_mode: "light",
  reduce_blue_light: "false",
  font_size: "normal",
  readable_text: "false",
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
  subscriptionPixKey: z.string().trim().min(3, "Informe uma chave Pix válida.").max(120, "Informe uma chave Pix mais curta."),
  subscriptionPixReceiverName: z.string().trim().min(2, "Informe o nome do recebedor.").max(100, "O nome do recebedor deve ter no máximo 100 caracteres."),
  subscriptionPixReceiverCity: z.string().trim().min(2, "Informe a cidade do recebedor.").max(80, "A cidade do recebedor deve ter no máximo 80 caracteres."),
  subscriptionPaymentAmount: z
    .string()
    .trim()
    .regex(/^\d+([,.]\d{1,2})?$/, "Informe um valor em reais válido.")
    .transform((value) => Number(value.replace(",", ".")).toFixed(2))
    .refine((value) => Number(value) > 0, "Informe um valor maior que zero.")
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
    subscriptionPaymentAmount: values.default_payment_amount
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

export function hasSubscriptionPixSettings(settings: FinancialSettings) {
  return Boolean(settings.subscriptionPixKey && settings.subscriptionPixReceiverName && settings.subscriptionPixReceiverCity);
}

export function hasPixSettings(settings: FinancialSettings) {
  return hasSubscriptionPixSettings(settings);
}

function amountStringToCents(value: string) {
  if (!value.trim()) {
    throw new Error("Informe o valor da assinatura.");
  }
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
