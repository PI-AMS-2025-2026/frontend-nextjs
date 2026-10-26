import { Roboto } from "next/font/google";

import { Footer } from "@/components/footer";
import { Header, type HeaderUser } from "@/components/header";
import { coordinatorHeaderConfig } from "./navigation";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const coordinatorUser: HeaderUser = {
  name: "UserName",
  role: "Coordenador",
};

export default function CoordinatorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${roboto.className} flex min-h-svh flex-col`}>
      <Header {...coordinatorHeaderConfig} user={coordinatorUser} />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
