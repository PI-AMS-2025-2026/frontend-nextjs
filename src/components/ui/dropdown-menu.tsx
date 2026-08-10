"use client";

import * as React from "react";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function DropdownMenu(
    props: React.ComponentProps<typeof DropdownMenuPrimitive.Root>
) {
    return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuTrigger(
    props: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>
) {
    return (
        <DropdownMenuPrimitive.Trigger
            data-slot="dropdown-menu-trigger"
            {...props}
        />
    );
}

function DropdownMenuContent({
    className,
    sideOffset = 6,
    ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
    return (
        <DropdownMenuPrimitive.Portal>
            <DropdownMenuPrimitive.Content
                data-slot="dropdown-menu-content"
                sideOffset={sideOffset}
                className={cn(
                    "z-50 min-w-[9rem] overflow-hidden rounded-lg border border-[#e2ecee] bg-white p-1 text-[#0c2c3e] shadow-lg",
                    className
                )}
                {...props}
            />
        </DropdownMenuPrimitive.Portal>
    );
}

function DropdownMenuItem({
    className,
    children,
    selected,
    ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
    selected?: boolean;
}) {
    return (
        <DropdownMenuPrimitive.Item
            data-slot="dropdown-menu-item"
            className={cn(
                "relative flex cursor-pointer items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-sm text-[#0c2c3e] outline-none select-none",
                "focus:bg-[#eef7f9] focus:text-[#0c2c3e] hover:bg-[#eef7f9]",
                className
            )}
            {...props}
        >
            {children}
            {selected && <CheckIcon className="size-4 text-[#2fa4b5]" />}
        </DropdownMenuPrimitive.Item>
    );
}

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem };