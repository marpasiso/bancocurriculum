import Link from "next/link";
import Image from "next/image";
import type { UserRole } from "@prisma/client";
import { logoutAction } from "@/modules/employer-auth-skill/actions";

type NavUser = {
  role: UserRole;
} | null;

function navItemsForUser(user: NavUser) {
  if (!user) {
    return [
      { href: "/", label: "Início" },
      { href: "/candidato", label: "Sou candidato" },
      { href: "/empregador/cadastro", label: "Sou empregador" },
      { href: "/login", label: "Login" }
    ];
  }

  if (user.role === "ADMIN") {
    return [
      { href: "/", label: "Início" },
      { href: "/admin/candidatos", label: "Candidatos" },
      { href: "/admin/empregadores", label: "Empregadores" },
      { href: "/admin/pagamentos-pix", label: "Pagamentos Pix" },
      { href: "/admin/solicitacoes-lgpd", label: "Solicitações LGPD" }
    ];
  }

  if (user.role === "SUPER_ADMIN") {
    return [
      { href: "/", label: "Início" },
      { href: "/admin/plano-do-sistema", label: "Plano do sistema" }
    ];
  }

  if (user.role === "EMPLOYER") {
    return [
      { href: "/", label: "Início" },
      { href: "/empregador/buscar-candidatos", label: "Buscar candidatos" },
      { href: "/empregador/assinatura", label: "Assinatura" }
    ];
  }

  return [{ href: "/", label: "Início" }];
}

export function Navbar({ user }: { user: NavUser }) {
  return (
    <header className="nav">
      <div className="nav-inner">
        <Link className="brand" href="/">
          <Image
            alt="Janaina Pinheiro Treinamentos"
            className="brand-logo"
            height={220}
            priority
            src="/brand/logo-janaina.jpeg"
            width={640}
          />
        </Link>
        <input className="nav-toggle" id="nav-toggle" type="checkbox" />
        <label className="nav-toggle-label" htmlFor="nav-toggle">Menu</label>
        <nav className="nav-links" aria-label="Navegação principal">
          {navItemsForUser(user).map((item) => (
            <Link key={item.href} href={item.href}>{item.label}</Link>
          ))}
          {user ? (
            <form action={logoutAction} className="nav-logout">
              <button className="inline-button logout-button" type="submit">Sair</button>
            </form>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
