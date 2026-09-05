import nodemailer from "nodemailer";

type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  secure: boolean;
};

type MailInput = {
  to: string;
  subject: string;
  text: string;
};

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error("Envio de e-mail não configurado.");
  }
  return value;
}

export function getRequiredAppUrl() {
  const appUrl = getRequiredEnv("APP_URL");

  try {
    return new URL(appUrl).origin;
  } catch {
    throw new Error("Endereço da aplicação não configurado corretamente.");
  }
}

function getSmtpConfig(): SmtpConfig {
  const port = Number.parseInt(getRequiredEnv("SMTP_PORT"), 10);

  if (!Number.isFinite(port) || port <= 0) {
    throw new Error("Envio de e-mail não configurado.");
  }

  return {
    host: getRequiredEnv("SMTP_HOST"),
    port,
    user: getRequiredEnv("SMTP_USER"),
    pass: getRequiredEnv("SMTP_PASS"),
    from: getRequiredEnv("SMTP_FROM"),
    secure: port === 465
  };
}

export function assertSmtpConfigured() {
  getSmtpConfig();
}

export async function sendSmtpMail(input: MailInput) {
  const config = getSmtpConfig();
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass
    }
  });

  try {
    await transporter.sendMail({
      from: config.from,
      to: input.to,
      subject: input.subject,
      text: input.text
    });
  } catch (error) {
    console.error("SMTP_SEND_ERROR", error);
    throw new Error("Não foi possível enviar o e-mail de redefinição.");
  }
}
