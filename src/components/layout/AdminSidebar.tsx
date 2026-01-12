import { ChevronRight, LogOut, PanelLeft } from 'lucide-react'
import { useLocation } from '@tanstack/react-router'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import CofferLogo from '@/components/shared/CofferLogo'
import TransitionLink from '@/components/layout/TransitionLink'
import { Button } from '@/components/ui/button'
import { adminNavData } from '@/static/adminLayoutStatic'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/components/layout/SidebarContext'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'

export default function AdminSidebar() {
  const { pathname } = useLocation()
  const { isCollapsed, toggleSidebar } = useSidebar()

  // Helper to check if a route is active
  const checkActive = (url: string) => {
    if (url === '#' || url === '/') return false
    return pathname === url || (url !== '/_admin' && pathname.startsWith(url))
  }

  // Helper to check if any child of a group is active
  const isGroupActive = (items: typeof adminNavData.navMain[0]['items']) => {
    return items?.some(item => checkActive(item.url))
  }

  // Tooltip wrapper for simple items in collapsed state
  const TooltipWrapper = ({ children, label }: { children: React.ReactNode; label: string }) => {
    if (!isCollapsed) return <>{children}</>
    return (
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    )
  }

  // Submenu component for collapsed state
  const CollapsedSubmenu = ({
    item,
    isActive
  }: {
    item: typeof adminNavData.navMain[0]
    isActive: boolean
  }) => {
    if (!item.items) return null

    return (
      <HoverCard openDelay={100} closeDelay={100}>
        <HoverCardTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-center h-11 px-0 text-sidebar-foreground hover:bg-accent hover:text-sidebar-foreground relative",
              isActive && "text-primary font-semibold hover:text-primary"
            )}
          >
            {item.icon && <item.icon className="size-5 shrink-0" />}
          </Button>
        </HoverCardTrigger>
        <HoverCardContent side="right" align="start" sideOffset={8}>
          <div className="font-semibold text-sm mb-2 px-2">{item.title}</div>
          <ul className="flex flex-col">
            {item.items.map((subItem) => {
              const isSubActive = checkActive(subItem.url)
              return (
                <li key={subItem.title}>
                  <TransitionLink to={subItem.url}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start h-8 px-2 text-sidebar-foreground hover:bg-accent hover:text-sidebar-foreground",
                        isSubActive && "text-primary font-semibold hover:text-primary"
                      )}
                    >
                      <span className="text-sm">{subItem.title}</span>
                    </Button>
                  </TransitionLink>
                </li>
              )
            })}
          </ul>
        </HoverCardContent>
      </HoverCard>
    )
  }

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r transition-all duration-200 ease-linear sticky top-0",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <CofferLogo size={32} />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleSidebar}
          className={cn(
            "text-sidebar-foreground hover:bg-sidebar-accent",
            isCollapsed && "mx-auto"
          )}
        >
          <PanelLeft className="size-4" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="flex flex-col gap-4">
          {adminNavData.navMain.map((item) => {
            // Check if item has sub-items
            if (item.items) {
              const isActive = isGroupActive(item.items)

              // Collapsed state: show HoverCard with submenu
              if (isCollapsed) {
                return (
                  <li key={item.title}>
                    <CollapsedSubmenu item={item} isActive={isActive || false} />
                  </li>
                )
              }

              // Expanded state: show Collapsible
              return (
                <Collapsible
                  key={item.title}
                  defaultOpen={isActive || false}
                  className="group/collapsible"
                >
                  <li>
                    <CollapsibleTrigger asChild disabled={isActive}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start gap-3 h-11 px-3 text-sidebar-foreground hover:bg-accent hover:text-sidebar-foreground relative disabled:opacity-100",
                          isActive && "text-primary font-semibold hover:text-primary",
                          isActive && "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-7 before:w-1 before:bg-primary before:rounded-r-full"
                        )}
                      >
                        {item.icon && <item.icon className="size-5 shrink-0" />}
                        <span className="flex-1 text-left text-sm">{item.title}</span>
                        <ChevronRight className="size-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <ul className="mt-1 ml-4 pl-4 border-l border-sidebar-border flex flex-col">
                        {item.items.map((subItem) => {
                          const isSubActive = checkActive(subItem.url)
                          return (
                            <li key={subItem.title}>
                              <TransitionLink to={subItem.url}>
                                <Button
                                  variant="ghost"
                                  className={cn(
                                    "w-full justify-start h-8 px-3 text-sidebar-foreground hover:bg-accent hover:text-sidebar-foreground relative",
                                    isSubActive && "text-primary font-semibold hover:text-primary before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-1 before:bg-primary before:rounded-r-full"
                                  )}
                                >
                                  <span className="text-sm">{subItem.title}</span>
                                  {/* @ts-ignore */}
                                  {subItem.badge && (
                                    <span className={cn(
                                      "ml-auto text-[10px] px-1.5 py-0.5 rounded-full",
                                      isSubActive ? "bg-primary/10 text-primary" : "bg-accent text-sidebar-foreground"
                                    )}>
                                      {/* @ts-ignore */}
                                      {subItem.badge}
                                    </span>
                                  )}
                                </Button>
                              </TransitionLink>
                            </li>
                          )
                        })}
                      </ul>
                    </CollapsibleContent>
                  </li>
                </Collapsible>
              )
            }

            const isItemActive = checkActive(item.url)

            return (
              <li key={item.title}>
                <TooltipWrapper label={item.title}>
                  <TransitionLink to={item.url}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 h-11 px-3 text-sidebar-foreground hover:bg-accent hover:text-sidebar-foreground relative",
                        isCollapsed && "justify-center px-0",
                        isItemActive && "text-primary font-semibold hover:text-primary before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-7 before:w-1 before:bg-primary before:rounded-r-full"
                      )}
                    >
                      {item.icon && <item.icon className="size-5 shrink-0" />}
                      {!isCollapsed && <span className="text-sm">{item.title}</span>}
                    </Button>
                  </TransitionLink>
                </TooltipWrapper>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-sidebar-border">
        {isCollapsed ? (
          <TooltipWrapper label="Logout">
            <Button
              variant="ghost"
              size="icon-sm"
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="size-4" />
            </Button>
          </TooltipWrapper>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-11 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="size-5 shrink-0" />
            <span className="text-sm">Logout</span>
          </Button>
        )}
      </div>
    </aside>
  )
}
