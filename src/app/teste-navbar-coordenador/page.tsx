import { Navbar } from "@/components/created/navbar";
import { Footer } from "@/components/created/footer";

export default function TesteNavbarPage() {
    return (
        <div className="flex min-h-screen flex-col bg-white">
            <Navbar tipo="coordenador" />
            <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
                <h1 className="text-2xl font-semibold text-[#1B4D62]">Bem-vindo!</h1>
                <p className="mt-2 text-gray-600">Explore abaixo um pouco do nosso sistema</p>
                <div className="mt-8 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-500">
                    Ambiente de teste da navbar e do footer do coordenador
                </div>
            </main>
            <Footer />
        </div>
    );
}
