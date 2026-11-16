import { Roboto } from "next/font/google";

import { Footer } from "@/components/footer";
import { Header, type HeaderUser } from "@/components/header";
import { administratorHeaderConfig } from "./navigation";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const administratorUser: HeaderUser = {
  name: "UserName",
  role: "Administrador",
};

export default function AdministratorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${roboto.className} flex min-h-svh flex-col`}>
      <Header {...administratorHeaderConfig} user={administratorUser} />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
