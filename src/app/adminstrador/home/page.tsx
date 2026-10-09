import type { Metadata } from "next";

import { AdministratorDashboard } from "./administrator-dashboard";

export const metadata: Metadata = {
  title: "Início | Gini",
  description: "Painel inicial do administrador",
};

export default function AdministratorHomePage() {
  return <AdministratorDashboard />;
}
