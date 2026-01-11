"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react"
import { TOAST_DURATION_IN_MS } from "@/constants/Constants"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      duration={TOAST_DURATION_IN_MS}
      position="top-center"
      className="toaster group sonner-toast-custom"
      toastOptions={{
        className: "pointer-events-auto"
      }}
      icons={{
        success: <CircleCheckIcon className="size-4 text-primary" />,
        info: <InfoIcon className="size-4 text-primary" />,
        warning: <TriangleAlertIcon className="size-4 text-destructive" />,
        error: <OctagonXIcon className="size-4 text-destructive" />,
        loading: <Loader2Icon className="size-4 animate-spin text-primary" />,
      }}

      // style={
      //   {
      //     "--normal-bg": "var(--popover)",
      //     "--normal-text": "var(--popover-foreground)",
      //     "--normal-border": "var(--border)",

      //     /* Accent ring / progress */
      //     "--accent": "var(--primary)",
      //     "--accent-text": "var(--primary-foreground)",

      //     "--border-radius": "calc(var(--radius) + 16px)",
      //   } as React.CSSProperties
      // }
      // toastOptions={{
      //   classNames: {
      //     toast:
      //       "font-sans border bg-popover text-popover-foreground shadow-sm ring-2 ring-border",
      //     title: "font-medium",
      //     description: "text-muted-foreground",
      //     actionButton:
      //       "bg-primary text-primary-foreground hover:bg-primary/90",
      //     cancelButton:
      //       "bg-muted text-muted-foreground hover:bg-muted/80",
      //     success: "ring-green-500/30 bg-green-50 dark:bg-green-950/20",
      //     error: "ring-red-500/30 bg-red-50 dark:bg-red-950/20",
      //   },
      // }}
      {...props}
    />
  )
}

export { Toaster }
