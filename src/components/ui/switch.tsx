"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default" | "lg"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "group/switch relative inline-flex items-center rounded-full transition-all",
        "data-checked:bg-primary data-unchecked:bg-input",
        "data-[size=sm]:h-[14px] data-[size=sm]:w-[24px]",
        "data-[size=default]:h-[18.4px] data-[size=default]:w-[32px]",
        "data-[size=lg]:h-[24px] data-[size=lg]:w-[44px]",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-background dark:data-unchecked:bg-foreground dark:data-checked:bg-primary-foreground rounded-full pointer-events-none block ring-0 transition-transform",

          // thumb sizes
          "group-data-[size=sm]/switch:size-3",
          "group-data-[size=default]/switch:size-4",
          "group-data-[size=lg]/switch:size-5",

          // translate distances
          "group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-2px)]",
          "group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-2px)]",
          "group-data-[size=lg]/switch:data-checked:translate-x-[calc(100%+2px)]",

          "group-data-[size=sm]/switch:data-unchecked:translate-x-0",
          "group-data-[size=default]/switch:data-unchecked:translate-x-0",
          "group-data-[size=lg]/switch:data-unchecked:translate-x-[2px]"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
