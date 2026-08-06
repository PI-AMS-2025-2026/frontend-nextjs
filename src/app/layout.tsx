import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cadastro de Horários",
  description: "Tela de gerenciamento de horários",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
