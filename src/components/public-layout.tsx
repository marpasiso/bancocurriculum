import Link from "next/link";
import type { ReactNode } from "react";
import { Navbar } from "./navbar";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="public-layout">
      <Navbar user={null} />
      {children}
      <footer className="footer">
        <div className="footer-inner">
          <span>Janaina Pinheiro Treinamentos - Banco de Pessoas para Oportunidades de Trabalho</span>
          <nav className="footer-links" aria-label="Links institucionais">
            <Link href="/privacidade">Privacidade</Link>
            <Link href="/termos">Termos</Link>
            <Link href="/lgpd">Direitos LGPD</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
