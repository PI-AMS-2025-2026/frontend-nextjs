import { Navbar } from "@/components/created/navbar";
import { Footer } from "@/components/created/footer";
import { administratorHeaderConfig } from "@/app/adminstrador/navigation";

export default function TesteNavbarPage() {
    return (
        <div className="flex min-h-screen flex-col bg-white">
            <Navbar
                tipo="administrador"
                homeHref={administratorHeaderConfig.homeHref}
                navigationGroups={administratorHeaderConfig.navigationGroups}
                historyHref="/adminstrador/historico-alteracao"
            />
            <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
                <h1 className="text-2xl font-semibold text-[#1B4D62]">Bem-vindo!</h1>
                <p className="mt-2 text-gray-600">Explore abaixo um pouco do nosso sistema</p>
                <div className="mt-8 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-500">
                    Ambiente de teste da navbar e do footer do administrador
                </div>
            </main>
            <Footer />
        </div>
    );
}
