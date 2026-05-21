import Link from "next/link"
import { footerColumns } from "@/data/footer-links"

export function Footer() {
  return (
    <footer className="bg-linear-to-r from-[#1a2540] to-[#1a4060] text-white">
      <div className="mx-auto flex flex-col gap-8 px-8 py-10 md:flex-row md:gap-0">

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:border-r md:border-white/20 md:pr-10">
          <div className="flex flex-col leading-none">
            <span className="font-['Sora',sans-serif] text-3xl font-bold tracking-wide">
              Fatec
            </span>
            <span className="text-[9px] tracking-widest text-white/50">
              Itu
            </span>
            <span className="text-[9px] tracking-widest text-white/50">
              Dom Amaury Castanho
            </span>
          </div>

          <div className="flex flex-col leading-none">
            <span className="font-['Sora',sans-serif] text-2xl font-bold tracking-wider">
              CpS
            </span>
            <span className="text-[9px] tracking-widest text-white/50">
              Centro Paula Souza
            </span>
          </div>

          <div className="flex flex-col leading-none">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/80">
              São Paulo
            </span>
            <span className="text-[9px] uppercase tracking-widest text-white/50">
              Governo do Estado
            </span>
            <span className="text-[9px] uppercase tracking-widest text-white/50">
              São Paulo São Todos
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:flex md:flex-1 md:justify-around md:pl-10 lg:grid-cols-5">
          {footerColumns.map((col, index) => (
            <div key={index} className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-white">
                {col.title}
              </span>
              {col.links.map((link, i) => (
                <Link
                  key={i}
                  href="#"
                  className="text-sm text-white/50 transition-colors hover:text-white"
                >
                  {link}
                </Link>
              ))}
            </div>
          ))}
        </div>

      </div>
    </footer>
  )
}