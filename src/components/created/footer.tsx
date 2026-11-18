
import Image from "next/image";
import Link from "next/link";
import { footerColumns } from "@/data/footer-links";

export function Footer() {
  return (
    <footer className="w-full bg-[#1B4D62] text-white">
      <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-6 px-8 py-7 md:flex-row md:items-center md:gap-8 lg:px-12">
        <div className="flex shrink-0 items-center justify-center md:border-r md:border-white/40 md:pr-8">
          <Image
            src="/images/login/fatec-cps-logo.png"
            alt="Fatec Itu e Centro Paula Souza"
            width={866}
            height={288}
            sizes="(min-width: 1024px) 260px, (min-width: 640px) 230px, 200px"
            className="h-auto w-[200px] object-contain sm:w-[230px] lg:w-[260px]"
          />
        </div>

        <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          {footerColumns.map((col, index) => (
            <div
              key={index}
              className="flex flex-col gap-2"
            >
              <span className="text-sm font-semibold text-white">
                {col.title}
              </span>

              {col.links.map((link, i) => (
                <Link
                  key={i}
                  href="#"
                  className="text-sm text-white/70 transition-colors hover:text-white"
                >
                  {link}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
