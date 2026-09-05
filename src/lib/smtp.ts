import net from "node:net";
import tls from "node:tls";

type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
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
    from: getRequiredEnv("SMTP_FROM")
  };
}

export function assertSmtpConfigured() {
  getSmtpConfig();
}

function encodeBase64(value: string) {
  return Buffer.from(value, "utf8").toString("base64");
}

function formatAddress(value: string) {
  return value.replace(/[\r\n<>]/g, "").trim();
}

function dotStuff(value: string) {
  return value.replace(/^\./gm, "..");
}

function buildMessage(config: SmtpConfig, input: MailInput) {
  const from = formatAddress(config.from);
  const to = formatAddress(input.to);
  const subject = input.subject.replace(/[\r\n]/g, " ");
  const date = new Date().toUTCString();

  return [
    `From: <${from}>`,
    `To: <${to}>`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    `Date: ${date}`,
    "",
    input.text
  ].join("\r\n");
}

async function connect(config: SmtpConfig) {
  if (config.port === 465) {
    return new Promise<tls.TLSSocket>((resolve, reject) => {
      const socket = tls.connect({ host: config.host, port: config.port, servername: config.host }, () => resolve(socket));
      socket.once("error", reject);
    });
  }

  return new Promise<net.Socket>((resolve, reject) => {
    const socket = net.connect({ host: config.host, port: config.port }, () => resolve(socket));
    socket.once("error", reject);
  });
}

export async function sendSmtpMail(input: MailInput) {
  const config = getSmtpConfig();
  let socket: net.Socket | tls.TLSSocket = await connect(config);
  let buffer = "";

  socket.setEncoding("utf8");
  socket.setTimeout(15000);

  function cleanup() {
    socket.removeAllListeners("data");
    socket.removeAllListeners("error");
    socket.removeAllListeners("timeout");
  }

  function readResponse() {
    return new Promise<number>((resolve, reject) => {
      function onData(chunk: string) {
        buffer += chunk;
        const lines = buffer.split(/\r?\n/);
        const lastCompleteLine = lines.length > 1 ? lines[lines.length - 2] : "";

        if (/^\d{3} /.test(lastCompleteLine)) {
          cleanup();
          buffer = lines[lines.length - 1] ?? "";
          resolve(Number.parseInt(lastCompleteLine.slice(0, 3), 10));
        }
      }

      function onError(error: Error) {
        cleanup();
        reject(error);
      }

      function onTimeout() {
        cleanup();
        reject(new Error("Tempo esgotado ao enviar e-mail."));
      }

      socket.on("data", onData);
      socket.once("error", onError);
      socket.once("timeout", onTimeout);
    });
  }

  async function expect(codes: number[]) {
    const code = await readResponse();
    if (!codes.includes(code)) {
      throw new Error("Não foi possível enviar o e-mail de redefinição.");
    }
  }

  async function command(value: string, codes: number[]) {
    socket.write(`${value}\r\n`);
    await expect(codes);
  }

  try {
    await expect([220]);
    await command(`EHLO ${config.host}`, [250]);

    if (config.port !== 465) {
      await command("STARTTLS", [220]);
      socket = tls.connect({ socket, servername: config.host });
      socket.setEncoding("utf8");
      await new Promise<void>((resolve, reject) => {
        socket.once("secureConnect", resolve);
        socket.once("error", reject);
      });
      await command(`EHLO ${config.host}`, [250]);
    }

    await command("AUTH LOGIN", [334]);
    await command(encodeBase64(config.user), [334]);
    await command(encodeBase64(config.pass), [235]);
    await command(`MAIL FROM:<${formatAddress(config.from)}>`, [250]);
    await command(`RCPT TO:<${formatAddress(input.to)}>`, [250, 251]);
    await command("DATA", [354]);
    socket.write(`${dotStuff(buildMessage(config, input))}\r\n.\r\n`);
    await expect([250]);
    socket.write("QUIT\r\n");
  } finally {
    socket.end();
  }
}
