import { ChevronRight, LogOut, PanelLeft } from 'lucide-react'
import { useLocation } from '@tanstack/react-router'
import { useCallback } from 'react'
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
import useWindowProperties from '@/hooks/useWindowProperty'

export default function AdminSidebar() {
  const { pathname } = useLocation()
  const { isCollapsed, setIsCollapsed, toggleSidebar } = useSidebar()

  // Auto-collapse sidebar on mobile/tablet
  const handleMobile = useCallback(() => {
    setIsCollapsed(true)
  }, [setIsCollapsed])

  useWindowProperties({
    onTabCallBack: handleMobile,
  })

  // Helper to check if a route is active
  const checkActive = (url: string) => {
    if (url === '#' || url === '/') return false
    // Generic: URLs ending with /all should match any path starting with the base
    // e.g., /users/all matches /users/[uuid], /investments/all matches /investments/[id]
    if (url.endsWith('/all')) {
      const basePath = url.replace('/all', '')
      return pathname.startsWith(basePath + '/')
    }
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
              "w-full justify-center h-11 px-0 text-white/70 hover:bg-white/10 hover:text-white relative transition-all duration-200 ease-in-out",
              isActive && "bg-background text-primary rounded-l-full rounded-r-none font-bold shadow-sm hover:bg-white hover:text-primary"
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
                        "w-full justify-start h-8 px-2 text-white/70 hover:bg-white/10",
                        isSubActive && "text-foreground font-semibold bg-white/10"
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
        "flex flex-col h-screen bg-primary border-r transition-all duration-200 ease-linear sticky top-0",
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
            "text-white/70 hover:bg-white/10 hover:text-white",
            isCollapsed && "mx-auto"
          )}
        >
          <PanelLeft className="size-4" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto pl-2 py-2 pr-0">
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
                        // variant="ghost"
                        className={cn(
                          "w-full justify-start gap-3 h-11 px-3 text-white/70 hover:bg-white/5 hover:text-white relative disabled:opacity-100",
                          "data-[state=open]:text-white data-[state=open]:font-semibold",
                          isActive && "text-white font-semibold bg-white/5",
                          isActive && "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-7 before:w-1 before:bg-white before:rounded-r-full"
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
                                  // variant="ghost"
                                  className={cn(
                                    "w-full justify-start h-8 px-3 text-white/70 hover:bg-white/5 hover:text-white relative font-medium transition-all duration-200 ease-in-out",
                                    isSubActive && "bg-white text-primary! rounded-l-full rounded-r-none font-bold shadow-sm hover:bg-white hover:text-primary pl-7"
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
                        "w-full justify-start gap-3 h-11 px-3 text-white/70 hover:bg-white/5! hover:text-white relative transition-all duration-200 ease-in-out",
                        isCollapsed && "justify-center px-0",
                        isItemActive && "bg-white text-primary rounded-l-full rounded-r-none font-bold shadow-sm hover:bg-white! hover:text-primary pl-2"
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
              className="w-full text-red-300 hover:text-red-200 hover:bg-red-500/10"
            >
              <LogOut className="size-4" />
            </Button>
          </TooltipWrapper>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-11 px-3 text-red-300 hover:text-red-200 hover:bg-red-500/10"
          >
            <LogOut className="size-5 shrink-0" />
            <span className="text-sm">Logout</span>
          </Button>
        )
        }
      </div >
    </aside >
  )
}
