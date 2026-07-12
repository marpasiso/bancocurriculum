import { redirect } from "next/navigation";
import { requireEmployerUser } from "@/modules/security-skill/permissions";

export default async function EmployerJobFunctionsPage() {
  await requireEmployerUser();
  redirect("/empregador/dashboard?info=As%20fun%C3%A7%C3%B5es%20e%20vagas%20s%C3%A3o%20gerenciadas%20pela%20administra%C3%A7%C3%A3o%20do%20sistema.");
}
