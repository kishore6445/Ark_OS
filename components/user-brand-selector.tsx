"use client"

import { useMemo } from "react"
import { useBrand, BRANDS } from "@/lib/brand-context"
import { useUser } from "@/lib/user-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Building2 } from "lucide-react"

export function UserBrandSelector() {
  const { currentUser, isLoading } = useUser()
  const { currentBrand, setCurrentBrand } = useBrand()

  const assignments = currentUser?.assignments ?? []

  const uniqueBrands = useMemo(() => {
    if (!currentUser) return []

    if (currentUser.role === "company_admin") {
      return Array.from(new Set(currentUser.company_brand_slugs || []))
    }

    return Array.from(new Set(assignments.map((assignment) => assignment.brand)))
  }, [assignments, currentUser])

  const formatBrandSlug = (value: string) =>
    value
      .split("-")
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(" ")

  const getBrandLabel = (brand: string) => {
    const config = BRANDS[brand as keyof typeof BRANDS]
    return config?.name ?? formatBrandSlug(brand)
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Building2 className="h-4 w-4" />
        <span>Loading brands...</span>
      </div>
    )
  }

  if (uniqueBrands.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Building2 className="h-4 w-4" />
        <span>No brands assigned</span>
      </div>
    )
  }

  if (uniqueBrands.length === 1) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Building2 className="h-4 w-4" />
        <span>{getBrandLabel(uniqueBrands[0])}</span>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Building2 className="h-4 w-4" />
          {getBrandLabel(currentBrand)}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Your Brand Assignments</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {uniqueBrands.map((brand) => {
          const depts = assignments.filter((assignment) => assignment.brand === brand).map((assignment) => assignment.department)

          return (
            <DropdownMenuItem
              key={brand}
              onClick={() => setCurrentBrand(brand)}
              className="flex flex-col items-start gap-1"
            >
              <div className="font-medium">{getBrandLabel(brand)}</div>
              <div className="text-xs text-muted-foreground">
                {depts.length} department{depts.length !== 1 ? "s" : ""}
              </div>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
