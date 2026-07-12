import { NextResponse } from "next/server";
import { generateAdminPixQr } from "@/modules/admin-console-skill/service";
import { requireOperationalAdminUser } from "@/modules/security-skill/permissions";

export async function POST(request: Request) {
  await requireOperationalAdminUser();

  try {
    const preview = await generateAdminPixQr(await request.json());
    return NextResponse.json(preview);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível gerar a cobrança Pix.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
