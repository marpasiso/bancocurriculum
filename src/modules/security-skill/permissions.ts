import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { getSafeSessionUser } from "./session";

function redirectAuthenticatedUser(role: UserRole) {
  if (role === UserRole.EMPLOYER) {
    redirect("/empregador/dashboard");
  }

  if (role === UserRole.SUPER_ADMIN) {
    redirect("/admin/dashboard");
  }

  if (role === UserRole.FINANCE_OWNER) {
    redirect("/");
  }

  redirect("/admin/dashboard");
}

export async function requireAdminUser() {
  const user = await getSafeSessionUser();
  if (!user || !user.isActive || (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN)) {
    if (!user) redirect("/login");
    redirectAuthenticatedUser(user.role);
  }
  return user;
}

export async function requireOperationalAdminUser() {
  const user = await getSafeSessionUser();
  if (!user || !user.isActive || user.role !== UserRole.ADMIN) {
    if (!user) redirect("/login");
    redirectAuthenticatedUser(user.role);
  }
  return user;
}

export async function requireOwnerFinanceUser() {
  const user = await getSafeSessionUser();
  if (!user || !user.isActive || (user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.FINANCE_OWNER)) {
    if (!user) redirect("/login");
    redirectAuthenticatedUser(user.role);
  }
  return user;
}

export async function requireSuperAdminUser() {
  const user = await getSafeSessionUser();
  if (!user || !user.isActive || user.role !== UserRole.SUPER_ADMIN) {
    if (!user) redirect("/login");
    redirectAuthenticatedUser(user.role);
  }
  return user;
}

export async function requireEmployerUser() {
  const user = await getSafeSessionUser();
  if (!user || !user.isActive || user.role !== UserRole.EMPLOYER || !user.employer) {
    if (!user) redirect("/login");
    redirectAuthenticatedUser(user.role);
  }
  return user as typeof user & { employer: { id: string; companyName: string; isActive: boolean } };
}
