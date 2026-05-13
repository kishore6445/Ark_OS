"use client"

import { useMemo, useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Megaphone,
  FileText,
  TrendingUp,
  Users,
  Cog,
  FlaskConical,
  Crown,
  Building2,
  FileBarChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  Award,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useBrand } from "@/lib/brand-context"
import { useUser } from "@/lib/user-context"
import type { Department } from "@/lib/brand-structure"

// Navigation configuration
const masteryNav = [
  { key: "marketing", letter: "M", label: "Marketing", icon: Megaphone, href: "/marketing" },
  { key: "accounts", letter: "A", label: "Accounts / Compliance / Finance", icon: FileText, href: "/accounts" },
  { key: "sales", letter: "S", label: "Sales", icon: TrendingUp, href: "/sales" },
  { key: "team", letter: "T", label: "Team Tools & SOPs", icon: Users, href: "/team" },
  { key: "execution", letter: "E", label: "Execution & Ops", icon: Cog, href: "/execution" },
  { key: "rnd", letter: "R", label: "R&D / Risk", icon: FlaskConical, href: "/rnd" },
  { key: "leadership", letter: "Y", label: "You (Leadership & Management)", icon: Crown, href: "/leadership" },
]

const reviewsNav = [
  { key: "company-review", label: "Company Performance", icon: Building2, href: "/company-review" },
  { key: "daily-report", label: "Daily Report", icon: FileBarChart, href: "/daily-report" },
  { key: "performance", label: "Performance", icon: Award, href: "/performance" },
]

const footerNav = [{ key: "admin", label: "Admin", icon: Settings, href: "/admin" }]

interface MasterySidebarProps {
  defaultCollapsed?: boolean
}

export function MasterySidebar({ defaultCollapsed = false }: MasterySidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const navRef = useRef<HTMLElement>(null)
  const { brandConfig } = useBrand()
  const { currentUser } = useUser()
  const router = useRouter()


  const currentUserRole = currentUser?.role ?? ""
  
  const normalizedCurrentUserRole = currentUserRole.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "")
  const isAdmin =
    normalizedCurrentUserRole === "super_admin" ||
    normalizedCurrentUserRole === "superadmin" ||
    normalizedCurrentUserRole === "company_admin" ||
    normalizedCurrentUserRole === "companyadmin"

  const departmentKeyMap: Record<string, Department> = {
    marketing: "marketing",
    accounts: "accounts",
    sales: "sales",
    team: "team-tools",
    execution: "execution",
    rnd: "rd",
    leadership: "leadership",
  }

  const visibleMasteryNav = useMemo(() => {
    const nav = !currentUser || isAdmin
      ? masteryNav
      : masteryNav.filter((item) => {
          const allowed = new Set(currentUser.assignments.map((assignment) => assignment.department))
          return allowed.has(departmentKeyMap[item.key])
        })
    return nav
  }, [currentUser, isAdmin])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!navRef.current) return

      const items = Array.from(navRef.current.querySelectorAll("a[href]"))

      if (e.key === "ArrowDown") {
        e.preventDefault()
        const nextIndex = focusedIndex < items.length - 1 ? focusedIndex + 1 : 0
        setFocusedIndex(nextIndex)
        ;(items[nextIndex] as HTMLElement)?.focus()
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        const prevIndex = focusedIndex > 0 ? focusedIndex - 1 : items.length - 1
        setFocusedIndex(prevIndex)
        ;(items[prevIndex] as HTMLElement)?.focus()
      }
    }

    const nav = navRef.current
    nav?.addEventListener("keydown", handleKeyDown)
    return () => nav?.removeEventListener("keydown", handleKeyDown)
  }, [focusedIndex])

  return (
    <aside
      role="navigation"
      aria-label="Main navigation"
      className={cn(
        "flex flex-col h-full bg-white border-r border-gray-200 transition-[width] duration-200 ease-in-out",
        collapsed ? "w-[76px]" : "w-[260px]",
      )}
    >
      {/* Top Area - Logo */}
      <div
        className={cn("flex items-center gap-3 px-4 h-16 border-b border-gray-200", collapsed && "justify-center px-2")}
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600" aria-hidden="true">
          <LayoutDashboard className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-base font-semibold text-gray-900">Arkmedis OS</span>
            <span className="text-xs text-gray-500">{brandConfig.name}</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4" ref={navRef}>
        {/* Dashboard */}
        <div className={cn("px-3 mb-2", collapsed && "px-2")}>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/dashboard"
                  aria-current={pathname === "/dashboard" ? "page" : undefined}
                  aria-label="Dashboard"
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                    pathname === "/dashboard"
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-blue-50 hover:text-blue-700",
                    "active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    collapsed && "justify-center px-2",
                  )}
                >
                  <LayoutDashboard className="h-5 w-5 shrink-0" aria-hidden="true" />
                  {!collapsed && <span>Dashboard_123</span>}
                </Link>
              </TooltipTrigger>
              {collapsed && <TooltipContent side="right">Dashboard</TooltipContent>}
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* MASTERY Framework Label */}
        {!collapsed && (
          <div className="px-6 py-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {brandConfig.shortName} Departments
            </p>
          </div>
        )}

        {/* MASTERY Navigation Items */}
        <div className={cn("space-y-1 px-3", collapsed && "px-2")} role="list" aria-label="MASTERY departments">
          {visibleMasteryNav.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <TooltipProvider key={item.key} delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      aria-label={`${item.label} department`}
                      role="listitem"
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group active:scale-95",
                        isActive ? "bg-blue-50" : "hover:bg-gray-50",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                        collapsed && "justify-center px-2",
                      )}
                    >
                      {/* Letter Chip */}
                      <div
                        className={cn(
                          "flex items-center justify-center w-8 h-8 rounded-md text-sm font-bold shrink-0 transition-all duration-150 border",
                          isActive
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-200 group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-200",
                        )}
                        aria-hidden="true"
                      >
                        {item.letter}
                      </div>

                      {/* Label and Icon */}
                      {!collapsed && (
                        <div className="flex items-center justify-between flex-1 min-w-0">
                          <span
                            className={cn(
                              "text-sm font-medium truncate transition-colors duration-150",
                              isActive ? "text-blue-700" : "text-gray-700 group-hover:text-blue-700",
                            )}
                          >
                            {item.label}
                          </span>
                          <Icon
                            className={cn(
                              "h-4 w-4 shrink-0 ml-2 transition-colors duration-150",
                              isActive ? "text-blue-600" : "text-gray-400 group-hover:text-blue-600",
                            )}
                            aria-hidden="true"
                          />
                        </div>
                      )}
                    </Link>
                  </TooltipTrigger>
                  {collapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
                </Tooltip>
              </TooltipProvider>
            )
          })}
        </div>

        {/* Divider */}
        <Separator className="my-4" role="separator" />

        {/* Reviews Section Heading */}
        {!collapsed && (
          <div className="px-6 py-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Reviews</p>
          </div>
        )}

        {/* Reviews Navigation Items */}
        <div className={cn("space-y-1 px-3", collapsed && "px-2")} role="list" aria-label="Review pages">
          {reviewsNav.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <TooltipProvider key={item.key} delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      aria-label={item.label}
                      role="listitem"
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 active:scale-95",
                        isActive ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                        collapsed && "justify-center px-2",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  </TooltipTrigger>
                  {collapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
                </Tooltip>
              </TooltipProvider>
            )
          })}
        </div>

        {/* Divider */}
        <Separator className="my-4" role="separator" />

        {/* Footer Navigation */}
        <div className={cn("space-y-1 px-3", collapsed && "px-2")}>
          {footerNav
            .filter((item) => (item.key === "admin" ? isAdmin : true))
            .map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <TooltipProvider key={item.key} delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      aria-label={item.label}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 active:scale-95",
                        isActive ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                        collapsed && "justify-center px-2",
                      )}
                    >
                      {collapsed ? (
                        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      ) : (
                        <>
                          <span className="truncate flex-1">{item.label}</span>
                          <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                        </>
                      )}
                    </Link>
                  </TooltipTrigger>
                  {collapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
                </Tooltip>
              </TooltipProvider>
            )
          })}
        </div>
      </nav>

      {/* User Card & Collapse Button */}
      <div className="border-t border-gray-200">
        {/* User Info */}
        <div className={cn("flex items-center gap-3 px-4 py-3", collapsed && "flex-col px-2 py-2")}>
          <Avatar className={cn("h-9 w-9 shrink-0", collapsed && "h-8 w-8")}>
            <AvatarFallback className="bg-blue-600 text-white text-sm font-semibold">
              {(currentUser?.name || "").trim().slice(0, 2).toUpperCase() || "JD"}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{currentUser?.name || "John Doe"}</p>
              <p className="text-xs text-gray-500 truncate">{currentUserRole || "Member"}</p>
            </div>
          )}
          {!collapsed && isAdmin && (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="User settings"
                    className="h-8 w-8 shrink-0 transition-all duration-150 hover:bg-gray-100 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    onClick={() => {
                      router.push('/admin')
                    }}
                  >
                    <Settings className="h-4 w-4 text-gray-500" aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Settings</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Collapse/Expand Button */}
        <div className={cn("px-4 pb-3", collapsed && "px-2 pb-2")}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            className={cn(
              "w-full justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all duration-150 active:scale-95",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              collapsed && "px-2",
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            )}
            {!collapsed && <span className="ml-2 text-xs">Collapse</span>}
          </Button>
        </div>
      </div>
    </aside>
  )
}
