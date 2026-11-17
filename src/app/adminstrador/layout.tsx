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
    <div className={`${roboto.className} flex min-h-svh flex-col`}>
      <Navbar
        tipo="administrador"
        homeHref={administratorHeaderConfig.homeHref}
        navigationGroups={administratorHeaderConfig.navigationGroups}
        historyHref="/adminstrador/historico-alteracao"
      />
      <div className="flex-1">{children}</div>
      <CreatedFooter />
    </div>
  );
}
