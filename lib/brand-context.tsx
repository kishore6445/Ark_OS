"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export type Brand = string

export interface CompanyWIG {
  goal: string
  description: string
  deadline: string
  yearTarget: number
  yearAchieved: number
  quarters: {
    q1: { target: number; achieved: number; deadline: string }
    q2: { target: number; achieved: number; deadline: string }
    q3: { target: number; achieved: number; deadline: string }
    q4: { target: number; achieved: number; deadline: string }
  }
  unit?: string
}

export interface BrandConfig {
  id: string
  name: string
  shortName: string
  color: string
  logo: string
  companyWIG: CompanyWIG
}

export const BRANDS: Record<string, BrandConfig> = {
  "warrior-systems": {
    id: "warrior-systems",
    name: "The Warrior Systems",
    shortName: "Warrior",
    color: "#1e40af", // blue-700
    logo: "⚔️",
    companyWIG: {
      goal: "Add 30 Clients for The Warrior System",
      description:
        "Wildly Achievable Revenue (WAR) Goal: Implement The Warrior Systems framework for 30 new companies by Dec 31, 2026",
      deadline: "Dec 31, 2026",
      yearTarget: 30,
      yearAchieved: 13,
      quarters: {
        q1: { target: 5, achieved: 4, deadline: "Mar 31, 2026" },
        q2: { target: 7, achieved: 5, deadline: "Jun 30, 2026" },
        q3: { target: 10, achieved: 4, deadline: "Sep 30, 2026" },
        q4: { target: 8, achieved: 0, deadline: "Dec 31, 2026" },
      },
      unit: "clients",
    },
  },
  "story-marketing": {
    id: "story-marketing",
    name: "Story Marketing",
    shortName: "Story",
    color: "#7c3aed", // violet-600
    logo: "📖",
    companyWIG: {
      goal: "Serve 10 Clients Implementing Story Marketing Framework",
      description:
        "Wildly Achievable Revenue (WAR) Goal: Serve 10 clients per month implementing Story Marketing Framework with zero founder involvement in operations by Dec 31, 2026",
      deadline: "Dec 31, 2026",
      yearTarget: 120, // 10 per month x 12 months
      yearAchieved: 45,
      quarters: {
        q1: { target: 30, achieved: 18, deadline: "Mar 31, 2026" },
        q2: { target: 30, achieved: 15, deadline: "Jun 30, 2026" },
        q3: { target: 30, achieved: 12, deadline: "Sep 30, 2026" },
        q4: { target: 30, achieved: 0, deadline: "Dec 31, 2026" },
      },
      unit: "clients",
    },
  },
  "meta-gurukul": {
    id: "meta-gurukul",
    name: "Meta Gurukul",
    shortName: "Meta",
    color: "#059669", // emerald-600
    logo: "🎓",
    companyWIG: {
      goal: "500 Active Students",
      description: "Enroll and maintain 500 active students in Meta Gurukul programs throughout 2026",
      deadline: "Dec 31, 2026",
      yearTarget: 500,
      yearAchieved: 220,
      quarters: {
        q1: { target: 100, achieved: 75, deadline: "Mar 31, 2026" },
        q2: { target: 150, achieved: 70, deadline: "Jun 30, 2026" },
        q3: { target: 150, achieved: 75, deadline: "Sep 30, 2026" },
        q4: { target: 100, achieved: 0, deadline: "Dec 31, 2026" },
      },
      unit: "students",
    },
  },
}

interface BrandContextType {
  currentBrand: string
  setCurrentBrand: (brand: string) => void
  brandConfig: BrandConfig
  isReady: boolean
}

const BrandContext = createContext<BrandContextType | undefined>(undefined)

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [currentBrand, setCurrentBrandState] = useState<string>("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("arkmedis-brand")
    if (saved) {
      setCurrentBrandState(saved)
    }
  }, [])

  const setCurrentBrand = (brand: string) => {
    setCurrentBrandState(brand)
    if (typeof window !== "undefined") {
      localStorage.setItem("arkmedis-brand", brand)
    }
  }

  const brandConfig: BrandConfig = BRANDS[currentBrand] ?? {
    id: currentBrand,
    name: currentBrand
      .split("-")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ") || "Select Brand",
    shortName: currentBrand.split("-")[0] ?? "",
    color: "#6b7280",
    logo: "🏷️",
    companyWIG: {
      goal: "",
      description: "",
      deadline: "",
      yearTarget: 0,
      yearAchieved: 0,
      quarters: {
        q1: { target: 0, achieved: 0, deadline: "" },
        q2: { target: 0, achieved: 0, deadline: "" },
        q3: { target: 0, achieved: 0, deadline: "" },
        q4: { target: 0, achieved: 0, deadline: "" },
      },
    },
  }

  return (
    <BrandContext.Provider value={{ currentBrand, setCurrentBrand, brandConfig, isReady: mounted }}>
      {children}
    </BrandContext.Provider>
  )
}

export function useBrand() {
  const context = useContext(BrandContext)
  if (!context) {
    return {
      currentBrand: "",
      setCurrentBrand: () => {},
      brandConfig: {
        id: "",
        name: "Select Brand",
        shortName: "",
        color: "#6b7280",
        logo: "🏷️",
        companyWIG: {
          goal: "",
          description: "",
          deadline: "",
          yearTarget: 0,
          yearAchieved: 0,
          quarters: {
            q1: { target: 0, achieved: 0, deadline: "" },
            q2: { target: 0, achieved: 0, deadline: "" },
            q3: { target: 0, achieved: 0, deadline: "" },
            q4: { target: 0, achieved: 0, deadline: "" },
          },
        },
      },
      isReady: true,
    }
  }
  return context
}
