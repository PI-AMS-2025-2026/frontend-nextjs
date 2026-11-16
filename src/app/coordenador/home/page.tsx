import type { Metadata } from "next";

import { CoordinatorDashboard } from "./coordinator-dashboard";

export const metadata: Metadata = {
  title: "Início | Gini",
  description: "Painel inicial do coordenador",
};

export default function CoordinatorHomePage() {
  return <CoordinatorDashboard />;
}
