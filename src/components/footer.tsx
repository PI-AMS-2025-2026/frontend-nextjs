import Image from "next/image";

export function Footer() {
  return (
    <footer className="mt-10 bg-gradient-to-r from-[#17264D] to-[#004A53] px-5 py-10 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:items-center">
        <div className="flex items-center gap-5 border-white/50 lg:w-[300px] lg:border-r lg:pr-7">
          <Image
            src="/images/administrator/institutional-logos.png"
            alt="Fatec, Centro Paula Souza e Governo do Estado de São Paulo"
            width={2170}
            height={621}
            className="h-auto w-72"
          />
        </div>

        <div className="grid flex-1 grid-cols-2 gap-7 sm:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="space-y-1 text-sm text-white/75">
              <p className="text-base font-semibold text-white">Exemple</p>
              <p>Text exemple</p>
              <p>Text exemple</p>
              <p>Text exemple</p>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
