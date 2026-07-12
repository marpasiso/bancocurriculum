function onlyAscii(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .trim();
}

function normalizePixKey(value: string) {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");

  if (digits.length === 11 && /^[1-9]{2}9\d{8}$/.test(digits)) {
    return `+55${digits}`;
  }

  if (digits.length === 13 && digits.startsWith("55")) {
    return `+${digits}`;
  }

  return trimmed;
}

function field(id: string, value: string) {
  const length = value.length.toString().padStart(2, "0");
  return `${id}${length}${value}`;
}

export function pixCrc16(payload: string) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i += 1) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function hasValidPixCrc(payload: string) {
  if (!/6304[A-Fa-f0-9]{4}$/.test(payload)) return false;
  const payloadWithoutCrc = payload.slice(0, -4);
  return pixCrc16(payloadWithoutCrc) === payload.slice(-4).toUpperCase();
}

export function createPixBrCode(input: {
  pixKey: string;
  receiverName: string;
  receiverCity: string;
  amountCents: number;
  description: string;
}) {
  const merchantAccount = field("00", "br.gov.bcb.pix") + field("01", onlyAscii(normalizePixKey(input.pixKey)));
  const amount = (input.amountCents / 100).toFixed(2);
  const txid = onlyAscii(input.description).slice(0, 25).replace(/\s+/g, "-") || "MVP";

  const payloadWithoutCrc =
    field("00", "01") +
    field("26", merchantAccount) +
    field("52", "0000") +
    field("53", "986") +
    field("54", amount) +
    field("58", "BR") +
    field("59", onlyAscii(input.receiverName).slice(0, 25).toUpperCase()) +
    field("60", onlyAscii(input.receiverCity).slice(0, 15).toUpperCase()) +
    field("62", field("05", txid)) +
    "6304";

  return `${payloadWithoutCrc}${pixCrc16(payloadWithoutCrc)}`;
}
