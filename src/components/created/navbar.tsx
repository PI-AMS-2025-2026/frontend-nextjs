
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  CalendarCheck2,
  ChevronDown,
  ClipboardList,
  DoorOpen,
  History,
  Home,
  Menu,
  School,
  Timer,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { cn } from "@/lib/utils";
import { authService } from "@/services/auth.service";
import type { UsuarioResponse } from "@/types/api";

export type TipoNavbar = "administrador" | "coordenador";

export type NavbarNavigationGroup = {
  label: string;
  links: readonly {
    label: string;
    href: string;
  }[];
};

type NavbarProps = {
  tipo: TipoNavbar;
  homeHref: string;
  navigationGroups: readonly NavbarNavigationGroup[];
  historyHref?: string;
};

type MenuItem = {
  label: string;
  icon: LucideIcon;
  href?: string;
  children?: NavbarNavigationGroup["links"];
};

const administratorIcons = [
  UsersRound,
  BookOpen,
  School,
  Timer,
  CalendarCheck2,
];
const coordinatorIcons = [CalendarCheck2, BookOpen, School];

function subscribeToStoredUser(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("auth:user-updated", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("auth:user-updated", onStoreChange);
  };
}

function getStoredUserSnapshot() {
  return window.localStorage.getItem("usuario") ?? "";
}

function parseStoredUser(snapshot: string): UsuarioResponse | null {
  try {
    return snapshot ? (JSON.parse(snapshot) as UsuarioResponse) : null;
  } catch {
    return null;
  }
}

export function Navbar({
  tipo,
  ...props
}: NavbarProps) {
  const pathname = usePathname();

  return (
    <NavbarContent
      key={`${pathname}:${tipo}`}
      tipo={tipo}
      {...props}
    />
  );
}

function NavbarContent({
  tipo,
  homeHref,
  navigationGroups,
  historyHref,
}: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const isAdministrador = tipo === "administrador";

  const icons = isAdministrador ? administratorIcons : coordinatorIcons;
  const menuItems: MenuItem[] = navigationGroups.map(
    (group, index) => ({
      label: group.label,
      children: group.links,
      icon: icons[index] ?? ClipboardList,
    }),
  );

  const profileLabel = isAdministrador ? "ADM" : "CRD";

  const [activeGroup, setActiveGroup] =
    React.useState<string | null>(null);

  const [profileOpen, setProfileOpen] =
    React.useState(false);

  const [mobileOpen, setMobileOpen] =
    React.useState(false);

  const [loggingOut, setLoggingOut] =
    React.useState(false);
  const userSnapshot = React.useSyncExternalStore(
    subscribeToStoredUser,
    getStoredUserSnapshot,
    () => "",
  );
  const storedUser = React.useMemo(() => parseStoredUser(userSnapshot), [userSnapshot]);
  const userName = storedUser?.nome?.trim() || "Usuário";
  const profileRole = storedUser?.tipoUsuario === "COORDENADOR"
    ? `Coordenador${storedUser.curso?.nome ? ` ${storedUser.curso.nome}` : ""}`
    : storedUser?.tipoUsuario === "ADMINISTRADOR"
      ? "Administrador"
      : isAdministrador ? "Administrador" : "Coordenador";

  const profileRef = React.useRef<HTMLDivElement>(null);
  const navigationRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node;

      if (
        profileRef.current &&
        !profileRef.current.contains(target)
      ) {
        setProfileOpen(false);
      }

      if (
        navigationRef.current &&
        !navigationRef.current.contains(target)
      ) {
        setActiveGroup(null);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setActiveGroup(null);
        setMobileOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );

      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, []);

  function closeMenus() {
    setActiveGroup(null);
    setProfileOpen(false);
    setMobileOpen(false);
  }

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await authService.logout();
      closeMenus();
      router.replace("/login");
    } catch (error) {
      console.error(
        "Erro ao encerrar sessão:",
        error,
      );

      setLoggingOut(false);
    }
  }

  return (
    <header className="relative z-50 w-full bg-[#1B4D62] text-white">
      <div className="mx-auto grid min-h-[90px] w-full max-w-[1800px] grid-cols-[1fr_auto] items-center gap-5 px-6 lg:grid-cols-[1fr_auto_1fr] lg:px-10">
        <Link
          href={homeHref}
          onClick={closeMenus}
          aria-label="Fatec - Página inicial"
          className="flex w-fit flex-col items-start justify-center leading-none"
        >
          <span className="text-[30px] font-bold tracking-tight">
            Fatec
          </span>

          <span className="mt-1 text-[9px] tracking-tight text-white/90">
            Dom Amaury Castanho
          </span>
        </Link>

        <nav
          ref={navigationRef}
            aria-label={`Navegação do ${isAdministrador ? "administrador" : "coordenador"}`}
          className="hidden items-center justify-center gap-4 lg:flex"
        >
          <Link
            href={homeHref}
            onClick={closeMenus}
            className={cn(
              "flex h-[42px] shrink-0 items-center gap-2 rounded-[6px] px-4 text-[15px] font-medium transition-colors",
              pathname === homeHref
                ? "bg-[#2B899D]"
                : "hover:bg-[#2B899D]",
            )}
          >
            <Home
              className="size-[22px]"
              strokeWidth={2}
              aria-hidden="true"
            />

            Início
          </Link>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const hasChildren = Boolean(
              item.children?.length,
            );

            const isOpen =
              activeGroup === item.label;

            if (!hasChildren) {
              return (
                <Link
                  key={item.label}
                  href={item.href ?? homeHref}
                  onClick={closeMenus}
                  className="flex h-[42px] shrink-0 items-center gap-2 rounded-md px-2 text-[15px] transition-colors hover:bg-white/10"
                >
                  <Icon
                    className="size-[22px]"
                    strokeWidth={1.7}
                    aria-hidden="true"
                  />

                  {item.label}
                </Link>
              );
            }

            return (
              <div
                key={item.label}
                className="relative shrink-0"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-haspopup="true"
                  onClick={() => {
                    setActiveGroup(
                      isOpen ? null : item.label,
                    );

                    setProfileOpen(false);
                  }}
                  className={cn(
                    "flex h-[42px] items-center gap-2 rounded-md px-2 text-[15px] transition-colors hover:bg-white/10",
                    isOpen && "bg-white/10",
                  )}
                >
                  <Icon
                    className="size-[22px]"
                    strokeWidth={1.7}
                    aria-hidden="true"
                  />

                  {item.label}

                  <ChevronDown
                    className={cn(
                      "size-[15px] transition-transform",
                      isOpen && "rotate-180",
                    )}
                    strokeWidth={1.7}
                    aria-hidden="true"
                  />
                </button>

                {isOpen && (
                  <div className="absolute left-0 top-[calc(100%+10px)] z-50 min-w-[245px] rounded-[8px] border border-[#D7E1E5] bg-white p-2 text-[#17264D] shadow-[0_5px_18px_rgba(0,0,0,0.15)]">
                    {item.children?.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={closeMenus}
                        className="block rounded-md px-3 py-3 text-[14px] transition-colors hover:bg-[#EAF4F7]"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center justify-self-end gap-4">
          <div
            ref={profileRef}
            className="relative flex items-center border-l border-white/80 pl-6"
          >
            <button
              type="button"
              aria-label={`Abrir menu do ${isAdministrador ? "administrador" : "coordenador"}`}
              aria-expanded={profileOpen}
              aria-haspopup="true"
              onClick={() => {
                setProfileOpen((previous) => !previous);
                setActiveGroup(null);
              }}
              className="grid size-[54px] place-items-center rounded-full border-[2px] border-[#45A9BB] bg-white text-[17px] font-semibold text-[#278FA2] transition-colors hover:bg-[#EAF8FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {profileLabel}
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-[calc(100%+14px)] z-50 w-[320px] max-w-[calc(100vw-24px)] rounded-[12px] border border-[#D9D9D9] bg-white p-5 text-black shadow-[0_5px_20px_rgba(0,0,0,0.12)]">
                <div className="mb-4 min-w-0 text-[16px] font-medium leading-5">
                  <p className="break-words [overflow-wrap:anywhere]">{userName}</p>
                  <p className="mt-1 break-words text-sm font-normal text-[#555] [overflow-wrap:anywhere]">
                    {profileRole}
                  </p>
                </div>

                {isAdministrador && historyHref && (
                  <Link
                    href={historyHref}
                    onClick={closeMenus}
                    className="mb-3 flex min-h-[60px] w-full items-center gap-4 rounded-[12px] border border-[#AAAAAA] px-4 text-[15px] text-[#444444] transition-colors hover:bg-[#F2F5F6]"
                  >
                    <History
                      className="size-[30px]"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />

                    Histórico de alterações
                  </Link>
                )}

                <button
                  type="button"
                  disabled={loggingOut}
                  onClick={handleLogout}
                  className="flex min-h-[60px] w-full items-center gap-4 rounded-[12px] border border-[#AAAAAA] px-4 text-left text-[15px] text-[#444444] transition-colors hover:bg-[#F2F5F6] disabled:cursor-wait disabled:opacity-60"
                >
                  <DoorOpen
                    className="size-[30px]"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />

                  {loggingOut ? "Saindo..." : "Sair"}
                </button>
              </div>
            )}
          </div>

          <Sheet
            open={mobileOpen}
            onOpenChange={setMobileOpen}
          >
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Abrir navegação"
                className="rounded-md p-2 transition-colors hover:bg-white/10 lg:hidden"
              >
                <Menu className="size-6" />
              </button>
            </SheetTrigger>

            <SheetContent
              side="left"
              className="w-[310px] max-w-[85vw] gap-0 border-r border-[#34798C] bg-[#1B4D62] p-0 text-white"
            >
              <SheetHeader className="border-b border-white/20 px-5 py-5">
                <SheetTitle className="flex items-center gap-2 text-left text-lg font-semibold text-white">
                  <Home
                    className="size-5"
                    strokeWidth={2}
                  />

                  Fatec
                </SheetTitle>
              </SheetHeader>

              <nav
                aria-label="Navegação móvel"
                className="flex flex-col overflow-y-auto px-3 py-4"
              >
                <Link
                  href={homeHref}
                  onClick={closeMenus}
                  className="rounded-md px-3 py-2.5 text-sm hover:bg-white/10"
                >
                  Início
                </Link>

                {menuItems.map((item) => (
                  <MobileNavItem
                    key={item.label}
                    item={item}
                    onNavigate={closeMenus}
                    homeHref={homeHref}
                  />
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function MobileNavItem({
  item,
  onNavigate,
  homeHref,
}: {
  item: MenuItem;
  onNavigate: () => void;
  homeHref: string;
}) {
  const [open, setOpen] = React.useState(false);
  const hasChildren = Boolean(item.children?.length);
  const Icon = item.icon;

  if (!hasChildren) {
    return (
      <Link
        href={item.href ?? homeHref}
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-md px-3 py-3 text-sm transition-colors hover:bg-white/10"
      >
        <Icon className="size-5 shrink-0" />

        {item.label}
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((previous) => !previous)}
        className="flex w-full items-center justify-between rounded-md px-3 py-3 text-left text-sm transition-colors hover:bg-white/10"
      >
        <span className="flex items-center gap-3">
          <Icon className="size-5 shrink-0" />

          {item.label}
        </span>

        <ChevronDown
          className={cn(
            "size-4 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="mb-2 flex flex-col border-l border-white/30 pl-5">
          {item.children?.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              onClick={onNavigate}
              className="rounded-md px-3 py-2 text-[13px] text-white/85 transition-colors hover:bg-white/10 hover:text-white"
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
