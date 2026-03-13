"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Brand, Department } from "./brand-structure"
import { supabase } from "@/lib/supabase/browserclient"

export type UserRole = "super_admin" | "company_admin" | "member" | "viewer" | "admin"

export interface UserAssignment {
  brand: Brand
  department: Department
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: UserRole
  company_id?: string | null
  company_brand_slugs?: string[]
  assignments: UserAssignment[] // Users can be assigned to multiple brand-department combinations
}

interface UserContextValue {
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
  isAssignedTo: (brand: Brand, department: Department) => boolean
  getUserAssignments: () => UserAssignment[]
  isLoading: boolean
}

const UserContext = createContext<UserContextValue | undefined>(undefined)

const SAMPLE_USERS: User[] = [
  {
    id: "user-1",
    name: "Sarah Martinez",
    email: "sarah@arkmedis.com",
    role: "member",
    assignments: [{ brand: "warrior-systems", department: "marketing" }],
  },
  {
    id: "user-2",
    name: "John Davidson",
    email: "john@arkmedis.com",
    role: "member",
    assignments: [{ brand: "story-marketing", department: "marketing" }],
  },
  {
    id: "user-3",
    name: "Michael Chen",
    email: "michael@arkmedis.com",
    role: "member",
    assignments: [
      { brand: "warrior-systems", department: "accounts" },
      { brand: "story-marketing", department: "accounts" },
      { brand: "meta-gurukul", department: "accounts" },
    ],
  },
  {
    id: "user-4",
    name: "Emily Rodriguez",
    email: "emily@arkmedis.com",
    role: "super_admin",
    assignments: [
      { brand: "warrior-systems", department: "leadership" },
      { brand: "story-marketing", department: "leadership" },
    ],
  },
]

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isActive = true

    const loadUser = async () => {
      try {
        setIsLoading(true)
        // attempt to grab access token from client session if available
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        console.log("[UserProvider] supabase sessionData:", sessionData, "error:", sessionError)
        if (!sessionData?.session) {
          console.log("[UserProvider] no session; document.cookie=", document.cookie)
        }
        if (sessionError) throw sessionError

        const accessToken = sessionData?.session?.access_token

        // always call /api/me; if we have a bearer token, send it, otherwise rely on cookie
        const headers: Record<string, string> = { "Content-Type": "application/json" }
        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`
        }

        const response = await fetch("/api/me", {
          headers,
          cache: "no-store",
        })

        if (!response.ok) {
          if (isActive) setCurrentUser(null)
          if (isActive) setIsLoading(false)
          return
        }

        const result = await response.json()
        console.log("[UserProvider] /api/me result:", result)
        if (isActive) setCurrentUser(result?.user || null)
        if (isActive) setIsLoading(false)
      } catch (err) {
        console.error("[UserProvider] loadUser error", err)
        if (isActive) setCurrentUser(null)
        if (isActive) setIsLoading(false)
      }
    }

    loadUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (!isActive) return
      if (event === "SIGNED_OUT") {
        setCurrentUser(null)
        setIsLoading(false)
        return
      }
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        loadUser()
      }
    })

    return () => {
      isActive = false
      authListener?.subscription.unsubscribe()
    }
  }, [])

  const isAssignedTo = (brand: Brand, department: Department): boolean => {
    if (!currentUser) return false
    return currentUser.assignments.some((a) => a.brand === brand && a.department === department)
  }

  const getUserAssignments = (): UserAssignment[] => {
    return currentUser?.assignments || []
  }

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, isAssignedTo, getUserAssignments, isLoading }}>
      {children}
    </UserContext.Provider>
  )
}

export function  useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}

export function getAllUsers(): User[] {
  return SAMPLE_USERS
}

export function isSharedDepartment(department: Department): boolean {
  return department === "accounts" || department === "leadership"
}
