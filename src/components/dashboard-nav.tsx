"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/modules/employer-auth-skill/actions";

type DashboardItem = {
  href: string;
  label: string;
};

function closeDrawer() {
  const toggle = document.getElementById("dashboard-drawer-toggle") as HTMLInputElement | null;
  if (toggle) {
    toggle.checked = false;
  }
}

function isActive(pathname: string, href: string) {
  if (href === "/admin/dashboard" || href === "/empregador/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardNav({ items }: { items: DashboardItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="dashboard-nav">
      {items.map((item) => (
        <Link
          aria-current={isActive(pathname, item.href) ? "page" : undefined}
          key={`${item.href}-${item.label}`}
          href={item.href}
          onClick={closeDrawer}
        >
          {item.label}
        </Link>
      ))}
      <form action={logoutAction} className="dashboard-logout">
        <button type="submit">Sair</button>
      </form>
    </nav>
  );
}
