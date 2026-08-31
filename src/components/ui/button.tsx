import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex w-fit shrink-0 items-center justify-center rounded-[15px] border border-transparent bg-clip-padding font-medium whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-[#17264D] text-white hover:bg-transparent hover:border-[#17264D] hover:text-[#17264D]",

        secondary:
          "bg-[#0099AA] text-white hover:bg-transparent hover:border-[#0099AA] hover:text-[#0099AA]",

        danger:
          "bg-[#BA1A1A] text-white hover:bg-transparent hover:border-[#BA1A1A] hover:text-[#BA1A1A]",

        ghost:
          "bg-transparent hover:bg-gray-100",
      },

      size: {
        large: "h-[55px] px-[20px] text-[24px]",
        medium: "h-[50px] px-[20px] text-[24px]",
        small: "h-[40px] px-[20px] text-[20px]",
      },
    },

    defaultVariants: {
      variant: "primary",
      size: "medium",
    },
  },
);

function Button({
  className,
  variant = "primary",
  size = "medium",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants }
