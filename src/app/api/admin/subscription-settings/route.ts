import { NextResponse } from "next/server";
import { requireOperationalAdminUser } from "@/modules/security-skill/permissions";
import { saveSubscriptionPaymentSettings } from "@/modules/settings/operational-settings.skill";

export async function POST(request: Request) {
  const user = await requireOperationalAdminUser();
  try {
    const settings = await saveSubscriptionPaymentSettings(user.id, await request.json());
    return NextResponse.json({ amount: settings.subscriptionPaymentAmount, pixKey: settings.subscriptionPixKey, receiverName: settings.subscriptionPixReceiverName, receiverCity: settings.subscriptionPixReceiverCity });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível salvar a configuração Pix.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
