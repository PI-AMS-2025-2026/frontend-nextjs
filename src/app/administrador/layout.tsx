import { Roboto } from "next/font/google";

import { Footer as CreatedFooter } from "@/components/created/footer";
import { Navbar } from "@/components/created/navbar";
import { administratorHeaderConfig } from "./navigation";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export default function AdministratorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // flex-1 (e não min-h-svh): ocupa o restante do <body>, que já tem a altura
    // da tela, sem somar a altura da faixa de ambiente e gerar rolagem.
    <div className={`${roboto.className} flex flex-1 flex-col`}>
      <Navbar
        tipo="administrador"
        homeHref={administratorHeaderConfig.homeHref}
        navigationGroups={administratorHeaderConfig.navigationGroups}
        historyHref="/administrador/historico-alteracao"
      />
      <div className="flex-1">{children}</div>
      <CreatedFooter />
    </div>
  );
}
