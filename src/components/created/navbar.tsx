"use client";

import * as React from "react";
import Link from "next/link";
import { Home, Menu } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { NavItem, navItems } from "@/data/nav-links";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 flex h-13 items-center gap-3 border-b border-primary bg-navbar-background px-4">
      <Link
        href="/"
        className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-md bg-primary text-slate-200 transition-colors hover:bg-blue-600"
      >
        <Home size={17} />
      </Link>

      <div className="h-6 w-px shrink-0 bg-primary" />

      <div className="hidden flex-1 md:flex">
        <NavigationMenu>
          <NavigationMenuList className="gap-0.5">
            {navItems.map((item) =>
              item.children ? (
                <NavigationMenuItem key={item.label}>
                  <NavigationMenuTrigger className="hover:bg-primary text-slate-200 data-[state=open]:bg-primary!">
                    {item.label}
                  </NavigationMenuTrigger>

                  <NavigationMenuContent>
                    <ul className="min-w-55 rounded-lg bg-navbar-background pb-1.5">
                      {item.children.map((child) => (
                        <DropdownItem key={child.label} href={child.href}>
                          {child.label}
                        </DropdownItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ) : (
                <NavigationMenuItem key={item.label}>
                  <NavigationMenuLink
                    asChild
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "h-auto rounded-md bg-transparent px-3 py-1.5 text-[13px] font-medium tracking-wide text-slate-200 hover:bg-[#253060] hover:text-white focus:bg-[#253060]",
                    )}
                  >
                    <Link href={item.href!}>{item.label}</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ),
            )}
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div className="flex-1" />

      <div className="flex md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <button className="flex items-center justify-center rounded-md bg-[#253060] p-1.5 text-slate-200 transition-colors hover:bg-blue-600">
              <Menu size={20} />
            </button>
          </SheetTrigger>

          <SheetContent
            side="left"
            className="w-75 max-w-[85vw] border-r border-[#253060] bg-[#1a2540] p-0 gap-0"
          >
            <SheetHeader className="flex-row items-center gap-3 border-b border-[#253060] px-5 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#253060]">
                <Home size={16} className="text-slate-200" />
              </div>
              <SheetTitle className="font-['Sora',sans-serif] text-base font-bold tracking-wide text-white">
                Fatec
              </SheetTitle>
            </SheetHeader>

            <nav className="overflow-y-auto">
              {navItems.map((item) => (
                <MobileNavItem key={item.label} item={item} />
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex shrink-0 flex-col items-end">
        <span className="font-['Sora',sans-serif] text-xl font-bold tracking-wide text-white">
          Fatec
        </span>
        <span className="text-[8px] tracking-widest text-slate-500">
          Dom Amaury Castanho
        </span>
      </div>
    </nav>
  );
}

function DropdownItem({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className="mx-1.5 flex items-center rounded text-[13px] text-white"
        >
          {children}
        </Link>
      </NavigationMenuLink>
    </li>
  );
}

function MobileNavItem({ item }: { item: NavItem }) {
  const [open, setOpen] = React.useState(false);
  const hasChildren = !!item.children?.length;

  return (
    <div className="border-b border-[#253060]">
      {hasChildren ? (
        <button
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between px-5 py-3.5 text-[14px] font-medium tracking-wide text-slate-200 transition-colors hover:bg-[#253060]"
        >
          {item.label}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn(
              "text-blue-400 transition-transform duration-200",
              open ? "rotate-180" : "rotate-0",
            )}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      ) : (
        <Link
          href={item.href!}
          className="flex w-full items-center px-5 py-3.5 text-[14px] font-medium tracking-wide text-slate-200 transition-colors hover:bg-[#253060]"
        >
          {item.label}
        </Link>
      )}

      {hasChildren && open && (
        <div className="bg-[#0f1a30] pb-1">
          {item.children!.map((child) => (
            <Link
              key={child.label}
              href={child.href}
              className="block px-8 py-2.5 text-[13px] text-blue-300 transition-colors hover:bg-[#1e3a6e] hover:text-white"
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
