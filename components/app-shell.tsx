"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Menu, X, Bell, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MasterySidebar } from "@/components/mastery-sidebar"
import { SkipLink } from "@/components/skip-link"
import { cn } from "@/lib/utils"
import { BrandSwitcher } from "@/components/brand-switcher"
import { UserBrandSelector } from "@/components/user-brand-selector"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { supabase } from "@/lib/supabase/browserclient"
import { useUser } from "@/lib/user-context"

export const ModeContext = React.createContext<{
  mode: "execution" | "setup"
  setMode: (mode: "execution" | "setup") => void
}>({
  mode: "execution",
  setMode: () => {},
})

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mode, setMode] = useState<"execution" | "setup">("execution")
  const router = useRouter()
  const { currentUser } = useUser()

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    ;(e.currentTarget as HTMLElement).dataset.touchStartX = touch.clientX.toString()
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!sidebarOpen) return
    const touch = e.touches[0]
    const startX = Number.parseFloat((e.currentTarget as HTMLElement).dataset.touchStartX || "0")
    const currentX = touch.clientX
    const diff = startX - currentX

    if (diff > 50) {
      setSidebarOpen(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace("/signin")
  }

  const userInitials = (currentUser?.name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "JD"

  return (
    <ModeContext.Provider value={{ mode, setMode }}>
      <div className="flex h-screen bg-gray-50">
        <SkipLink />

        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <MasterySidebar />
        </div>

        {/* Mobile Sidebar - Add touch handlers for swipe to close */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:hidden",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          aria-hidden={!sidebarOpen}
        >
          <MasterySidebar />
        </div>

        {/* Mobile overlay - Add touch handler to close */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            onTouchEnd={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setSidebarOpen(false)
              }
            }}
          />
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header
            className="h-14 lg:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6"
            role="banner"
          >
            <div className="flex items-center gap-2 lg:gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-9 w-9 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label={sidebarOpen ? "Close menu" : "Open menu"}
                aria-expanded={sidebarOpen}
                aria-controls="mobile-sidebar"
              >
                {sidebarOpen ? (
                  <X className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Menu className="h-5 w-5" aria-hidden="true" />
                )}
              </Button>

              <BrandSwitcher />
            </div>

            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600" role="status" aria-live="polite">
              <Calendar className="h-4 w-4" aria-hidden="true" />
              <time dateTime={new Date().toISOString()}>
                <span className="hidden md:inline">
                  {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
                <span className="md:hidden">
                  {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </time>
            </div>

            <div className="flex items-center gap-2 lg:gap-3">
              <div className="hidden md:block">
                <UserBrandSelector />
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5 text-gray-600" aria-hidden="true" />
                <span className="sr-only">0 unread notifications</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="p-0 h-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-full"
                    aria-label="User menu"
                  >
                    <Avatar className="h-8 w-8 lg:h-9 lg:w-9">
                      <AvatarFallback className="bg-blue-600 text-white text-xs lg:text-sm">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 lg:px-8">
              <div className="pt-4 lg:pt-6">
                <Breadcrumbs />
              </div>
            </div>
            {children}
          </main>
        </div>
      </div>
    </ModeContext.Provider>
  )
}
