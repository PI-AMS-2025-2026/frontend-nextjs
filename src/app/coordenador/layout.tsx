import { Roboto } from "next/font/google";

import { Footer as CreatedFooter } from "@/components/created/footer";
import { Navbar } from "@/components/created/navbar";
import { coordinatorHeaderConfig } from "./navigation";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export default function CoordinatorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${roboto.className} flex min-h-svh flex-col`}>
      <Navbar
        tipo="coordenador"
        homeHref={coordinatorHeaderConfig.homeHref}
        navigationGroups={coordinatorHeaderConfig.navigationGroups}
      />
      <div className="flex-1">{children}</div>
      <CreatedFooter />
    </div>
  );
}
