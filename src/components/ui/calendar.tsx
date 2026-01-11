"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
} from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  children: footerContent,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"],
  children: React.ReactNode
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      footer={footerContent}
      className={cn(
        "bg-background group/calendar p-3 md:p-5 [--cell-size:theme(spacing.9)] md:[--cell-size:theme(spacing.10)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent border border-border/50 rounded-xl shadow-sm",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "flex gap-4 md:gap-5 flex-col md:flex-row relative",
          defaultClassNames.months
        ),
        month: cn("flex flex-col w-full gap-6 md:gap-8", defaultClassNames.month),
        nav: cn(
          "flex items-center gap-2 w-full absolute top-0 inset-x-0 justify-between",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-8 md:size-9 aria-disabled:opacity-50 p-0 select-none hover:bg-accent/50 transition-colors border border-border/30 shadow-sm hover:shadow",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-8 md:size-9 aria-disabled:opacity-50 p-0 select-none hover:bg-accent/50 transition-colors border border-border/30 shadow-sm hover:shadow",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex items-center justify-center h-10 md:h-11 w-full px-10 md:px-11",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "w-full flex items-center text-sm md:text-base font-semibold justify-center h-10 md:h-11 gap-1.5 md:gap-2",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative has-focus:border-ring border border-border/40 shadow-sm has-focus:ring-ring/30 has-focus:ring-2 rounded-lg",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute bg-popover inset-0 opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "select-none font-semibold",
          captionLayout === "label"
            ? "text-sm md:text-base"
            : "rounded-lg pl-2.5 md:pl-3 pr-1.5 md:pr-2 flex items-center gap-1.5 md:gap-2 text-sm md:text-base h-9 md:h-10 [&>svg]:text-muted-foreground [&>svg]:size-3.5 md:[&>svg]:size-4",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex mb-1.5 md:mb-2", defaultClassNames.weekdays),
        weekday: cn(
          "text-muted-foreground rounded-lg flex-1 font-semibold text-xs md:text-sm uppercase tracking-wider select-none",
          defaultClassNames.weekday
        ),
        week: cn("flex w-full mt-1", defaultClassNames.week),
        week_number_header: cn(
          "select-none w-9 md:w-10",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-sm select-none text-muted-foreground font-medium",
          defaultClassNames.week_number
        ),
        day: cn(
          "relative w-full h-full p-0.5 text-center [&:last-child[data-selected=true]_button]:rounded-r-xl group/day aspect-square select-none",
          props.showWeekNumber
            ? "[&:nth-child(2)[data-selected=true]_button]:rounded-l-xl"
            : "[&:first-child[data-selected=true]_button]:rounded-l-xl",
          defaultClassNames.day
        ),
        range_start: cn(
          "bg-primary/10",
          defaultClassNames.range_start,
          'rounded-full'
        ),
        range_middle: cn("bg-primary/5", defaultClassNames.range_middle, 'rounded-full'),
        range_end: cn("bg-primary/10", defaultClassNames.range_end, 'rounded-full'),
        today: cn(
          "bg-accent/30 text-accent-foreground rounded-full data-[selected=true]:rounded-none font-semibold border border-border/20",
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground/50 aria-selected:text-muted-foreground/50",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-muted-foreground opacity-40",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-4 md:size-5", className)} {...props} />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("size-4 md:size-5", className)}
                {...props}
              />
            )
          }

          return (
            <ChevronDownIcon className={cn("size-4 md:size-5", className)} {...props} />
          )
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-9 md:size-10 items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[selected-single=true]:shadow-sm data-[range-middle=true]:bg-primary/10 data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-start=true]:shadow-sm data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-end=true]:shadow-sm group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/30 hover:border-border/40 dark:hover:text-accent-foreground flex aspect-square size-auto w-full min-w-9 md:min-w-10 flex-col gap-1 leading-none font-medium text-sm md:text-base group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-2 data-[range-end=true]:rounded-xl data-[range-end=true]:rounded-r-xl data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-xl data-[range-start=true]:rounded-l-xl transition-all duration-200 border border-transparent [&>span]:text-xs md:[&>span]:text-sm [&>span]:opacity-70 data-[selected-single=true]:hover:bg-primary",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }