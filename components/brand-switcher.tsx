"use client"

import { useEffect, useMemo } from "react"
import { Check, Building2, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useBrand, BRANDS } from "@/lib/brand-context"
import { useUser } from "@/lib/user-context"
import { cn } from "@/lib/utils"

type BrandOption = { id: string; name: string; logo: string }

function resolveBrand(slug: string): BrandOption {
  const known = BRANDS[slug as keyof typeof BRANDS]
  if (known) return { id: known.id, name: known.name, logo: known.logo }
  const name = slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ")
  return { id: slug, name, logo: "🏷️" }
}

export function BrandSwitcher() {
  const { currentBrand, setCurrentBrand, brandConfig, isReady } = useBrand()
  const { currentUser, isLoading: isUserLoading } = useUser()

  const assignedBrandIds = useMemo(() => {
    if (!currentUser) return []

    if (currentUser.role === "company_admin") {
      return Array.from(new Set(currentUser.company_brand_slugs || []))
    }

    return Array.from(new Set((currentUser.assignments || []).map((assignment) => assignment.brand)))
  }, [currentUser])

  const availableBrands = useMemo<BrandOption[]>(
    () => assignedBrandIds.map(resolveBrand),
    [assignedBrandIds],
  )

  const selectedBrand: BrandOption =
    availableBrands.find((brand) => brand.id === currentBrand) ||
    availableBrands[0] ||
    { id: brandConfig.id, name: brandConfig.name, logo: brandConfig.logo }

  useEffect(() => {
    if (isUserLoading) return
    if (availableBrands.length === 0) return
    if (!availableBrands.some((brand) => brand.id === currentBrand)) {
      setCurrentBrand(availableBrands[0].id)
    }
  }, [isUserLoading, availableBrands, currentBrand, setCurrentBrand])

  if (!isReady || isUserLoading) {
    return (
      <Button
        variant="outline"
        className="h-10 px-4 gap-2 border-gray-300 bg-transparent opacity-50"
        disabled
        aria-label="Loading brand selector"
      >
        <Building2 className="h-4 w-4" aria-hidden="true" />
        <span className="font-medium text-sm">Loading...</span>
        <ChevronDown className="h-4 w-4 text-gray-500" aria-hidden="true" />
      </Button>
    )
  }

  if (availableBrands.length === 0) {
    return (
      <Button
        variant="outline"
        className="h-10 px-4 gap-2 border-gray-300 bg-transparent opacity-60"
        disabled
        aria-label="No brand assignments"
      >
        <Building2 className="h-4 w-4" aria-hidden="true" />
        <span className="font-medium text-sm">No brands assigned</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-10 px-4 gap-2 border-gray-300 hover:bg-gray-50 bg-transparent"
          aria-label={`Switch brand. Current: ${selectedBrand.name}`}
        >
          <Building2 className="h-4 w-4" aria-hidden="true" />
          <span className="font-medium text-sm">{selectedBrand.name}</span>
          <ChevronDown className="h-4 w-4 text-gray-500" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {availableBrands.map((brand) => (
          <DropdownMenuItem
            key={brand.id}
            onClick={() => setCurrentBrand(brand.id)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 cursor-pointer",
              currentBrand === brand.id && "bg-blue-50",
            )}
          >
            <span className="text-xl" aria-hidden="true">
              {brand.logo}
            </span>
            <div className="flex-1">
              <div className="font-medium text-sm">{brand.name}</div>
            </div>
            {currentBrand === brand.id && <Check className="h-4 w-4 text-blue-600" aria-hidden="true" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
