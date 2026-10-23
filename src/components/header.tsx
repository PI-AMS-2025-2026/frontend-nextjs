"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { authService } from "@/services/auth.service";

export type HeaderNavigationGroup = {
  label: string;
  links: readonly {
    label: string;
    href: string;
  }[];
};

export type HeaderUser = {
  name: string;
  role: string;
};

export type HeaderConfig = {
  homeHref: string;
  homeEventName?: string;
  navigationGroups: readonly HeaderNavigationGroup[];
};

type HeaderProps = HeaderConfig & {
  user: HeaderUser;
};

function BrandLogo() {
  return (
    <div className="relative h-[58px] w-[104px] shrink-0 overflow-hidden">
      <Image
        src="/images/administrator/fatec-logo.png"
        alt="Fatec Itu — Dom Amaury Castanho"
        width={866}
        height={288}
        priority
        className="absolute left-[-4.35%] top-[-21.88%] h-[143.75%] w-[240.3%] max-w-none"
      />
    </div>
  );
}

function HomeLink({ href, eventName }: { href: string; eventName?: string }) {
  return (
    <Link
      href={href}
      onClick={() => eventName && window.dispatchEvent(new Event(eventName))}
      aria-label="Voltar ao início"
      className="grid size-[60px] shrink-0 place-items-center rounded-xl border border-[#0099AA]/80 bg-[#0C2E59] transition-colors hover:bg-[#16406F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
    >
      <Image src="/images/administrator/home.svg" alt="" width={42} height={35} className="h-[35px] w-[42px]" />
    </Link>
  );
}

type DesktopNavigationProps = {
  navigationGroups: readonly HeaderNavigationGroup[];
  value: string;
  onValueChange: (value: string) => void;
};

function DesktopNavigation({ navigationGroups, value, onValueChange }: DesktopNavigationProps) {
  return (
    <NavigationMenu
      viewport={false}
      value={value}
      onValueChange={onValueChange}
      className="max-w-none flex-1 items-start"
    >
      <NavigationMenuList className="w-full items-start! justify-between gap-4">
        {navigationGroups.map((group) => (
          <NavigationMenuItem key={group.label} value={group.label}>
            <NavigationMenuTrigger className="h-[65px] w-[clamp(135px,11.24vw,170px)] justify-center rounded-xl border border-[#0099AA]/50 bg-gradient-to-r from-[#17264D] to-[#006570] px-2 text-center text-xl leading-6 font-semibold whitespace-normal text-white hover:brightness-110 focus:brightness-110 data-open:border-[#00BCD0] 2xl:text-2xl 2xl:leading-7 [&_svg]:hidden">
              {group.label}
            </NavigationMenuTrigger>

            <NavigationMenuContent className="absolute! top-full! left-0! mt-0! w-auto! min-w-max rounded-none bg-transparent! p-0 pt-2 text-white! shadow-none! ring-0! group-data-[viewport=false]/navigation-menu:bg-transparent! group-data-[viewport=false]/navigation-menu:text-white! group-data-[viewport=false]/navigation-menu:shadow-none! group-data-[viewport=false]/navigation-menu:ring-0! md:absolute! md:w-auto!">
              <div className={cn("grid gap-x-10 gap-y-1", group.links.length > 2 && "grid-cols-2")}>
                {group.links.map((link) => (
                  <NavigationMenuLink key={link.label} asChild>
                    <Link
                      href={link.href}
                      className="rounded-none border-b-2 border-[#0099AA] bg-transparent! px-0 py-0.5 text-xl font-semibold text-white hover:bg-transparent! hover:text-[#72E2EA] focus:bg-transparent! data-active:bg-transparent!"
                    >
                      {link.label}
                    </Link>
                  </NavigationMenuLink>
                ))}
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function MobileNavigation({ navigationGroups }: { navigationGroups: readonly HeaderNavigationGroup[] }) {
  return (
    <NavigationMenu viewport={false} className="ml-auto max-w-none">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="h-12 border border-[#0099AA]/70 bg-[#0C2E59] px-4 text-base text-white hover:bg-[#16406F] focus:bg-[#16406F] data-open:bg-[#16406F] [&>svg:last-child]:hidden">
            <Menu className="mr-2 size-5" aria-hidden="true" />
            Menu
          </NavigationMenuTrigger>

          <NavigationMenuContent className="right-0 left-auto top-full mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl bg-[#0C2E59]! p-4 text-white! shadow-lg ring-1 ring-[#0099AA]/70 group-data-[viewport=false]/navigation-menu:bg-[#0C2E59]! group-data-[viewport=false]/navigation-menu:text-white!">
            <div className="space-y-4">
              {navigationGroups.map((group) => (
                <div key={group.label}>
                  <p className="mb-1 text-sm font-bold text-[#72E2EA]">{group.label}</p>
                  {group.links.map((link) => (
                    <NavigationMenuLink key={link.label} asChild>
                      <Link
                        href={link.href}
                        className="block rounded-md bg-transparent! px-2 py-1.5 text-sm text-white hover:bg-white/10! focus:bg-white/10! data-active:bg-white/10!"
                      >
                        {link.label}
                      </Link>
                    </NavigationMenuLink>
                  ))}
                </div>
              ))}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

export function Header({
  homeHref,
  homeEventName,
  navigationGroups,
  user,
}: HeaderProps) {
  const router = useRouter();
  const [openMenu, setOpenMenu] = React.useState("");
  const openGroup = navigationGroups.find((group) => group.label === openMenu);
  const dropdownRows = openGroup
    ? openGroup.links.length > 2
      ? Math.ceil(openGroup.links.length / 2)
      : openGroup.links.length
    : 0;

  function handleLogout() {
    authService.logout();
    router.push("/login");
  }

  return (
    <>
      <header className="relative z-30 bg-gradient-to-r from-[#17264D] to-[#004A53] px-5 py-4 xl:px-[30px]">
        {dropdownRows > 0 && (
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-x-0 top-full bg-gradient-to-r from-[#17264D] to-[#004A53]",
              dropdownRows > 1 ? "h-20" : "h-14",
            )}
          />
        )}

        <div className="relative z-10 mx-auto flex max-w-[1452px] items-start gap-7">
          <HomeLink href={homeHref} eventName={homeEventName} />
          <div className="mt-1 hidden h-[51px] w-0.5 bg-white/80 xl:block" aria-hidden="true" />
          <div className="hidden min-w-0 flex-1 xl:block">
            <DesktopNavigation
              navigationGroups={navigationGroups}
              value={openMenu}
              onValueChange={setOpenMenu}
            />
          </div>
          <div className="hidden xl:block">
            <BrandLogo />
          </div>
          <div className="flex flex-1 items-center justify-end gap-4 xl:hidden">
            <BrandLogo />
            <MobileNavigation navigationGroups={navigationGroups} />
          </div>
        </div>
      </header>

      <div className="relative z-20 flex min-h-[70px] items-center justify-between gap-4 border-b border-[#D9D9D9] bg-white px-4 py-2 sm:px-5">
        <p className="min-w-0 text-base text-black sm:text-xl">
          <strong className="text-xl font-semibold sm:text-2xl">Bem-vindo!</strong>{" "}
          <span className="font-medium text-black/80 max-sm:hidden">Explore abaixo um pouco do nosso sistema</span>
        </p>

        <div className="flex shrink-0 items-center gap-2">
          <div className="relative h-[53px] w-[55px] max-sm:hidden" aria-hidden="true">
            <Image src="/images/administrator/profile-ring.svg" alt="" fill sizes="55px" className="object-fill" />
            <Image src="/images/administrator/profile-fill.svg" alt="" fill sizes="55px" className="object-fill" />
            <Image src="/images/administrator/profile-user.svg" alt="" width={28} height={30} className="absolute left-[13px] top-[11px]" />
          </div>
          <div className="min-w-0 max-w-32 leading-tight sm:max-w-56">
            <p className="truncate text-base font-medium text-black sm:text-2xl" title={user.name}>
              {user.name}
            </p>
            <p className="truncate text-sm text-[#0099AA] sm:text-xl" title={user.role}>
              {user.role}
            </p>
          </div>
          <div className="mx-1 h-14 w-px bg-black/40" aria-hidden="true" />
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Sair do sistema"
            className="grid size-10 place-items-center rounded-md transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0099AA]"
          >
            <Image src="/images/administrator/logout.svg" alt="" width={28} height={29} className="h-[29px] w-7" />
          </button>
        </div>
      </div>
    </>
  );
}
