"use client"

import { useEffect, useState } from "react"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface CompanyBrand {
  id: string
  company_id: string
  brand_name: string
  brand_slug: string
  created_at: string
}

interface CompanyBrandsManagementProps {
  companyId: string
}

export function CompanyBrandsManagement({ companyId }: CompanyBrandsManagementProps) {
  const [assignedBrands, setAssignedBrands] = useState<CompanyBrand[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [brandName, setBrandName] = useState<string>("")
  const [brandSlug, setBrandSlug] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [successMessage, setSuccessMessage] = useState<string>("")

  // Load assigned brands
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError("")

        // Fetch assigned brands for this company
        const response = await fetch(
          `/api/superadmin/companies/${companyId}/brands`,
        )

        if (!response.ok) {
          throw new Error("Failed to fetch company brands")
        }

        const data = await response.json()
        setAssignedBrands(data.brands || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [companyId])

  const handleAddBrand = async () => {
    if (!brandName.trim() || !brandSlug.trim()) {
      setError("Please enter both brand name and slug")
      return
    }

    try {
      setIsAdding(true)
      setError("")

      const response = await fetch(
        `/api/superadmin/companies/${companyId}/brands`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            brand_name: brandName.trim(),
            brand_slug: brandSlug.trim(),
          }),
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add brand")
      }

      const result = await response.json()
      setAssignedBrands([
        ...assignedBrands,
        result.data,
      ])

      setBrandName("")
      setBrandSlug("")
      setSuccessMessage("Brand added successfully!")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add brand")
    } finally {
      setIsAdding(false)
    }
  }

  const handleRemoveBrand = async (companyBrandId: string) => {
    try {
      setError("")

      const response = await fetch(
        `/api/superadmin/companies/${companyId}/brands?company_brand_id=${companyBrandId}`,
        {
          method: "DELETE",
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to remove brand")
      }

      setAssignedBrands(
        assignedBrands.filter((ab) => ab.id !== companyBrandId),
      )
      setSuccessMessage("Brand removed successfully!")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove brand")
    }
  }

  if (isLoading) {
    return (
      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle>Assigned Brands</CardTitle>
          <CardDescription>Manage brands for this company</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Add Brand Section */}
      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-lg">Add New Brand</CardTitle>
          <CardDescription>
            Assign available brands to this company
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {successMessage}
            </div>
          )}

          <div className="space-y-3">
            <div className="flex gap-3">
              <Input
                placeholder="Brand Name (e.g., Warrior Systems)"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                disabled={isAdding}
                className="flex-1"
              />

              <Input
                placeholder="Brand Slug (e.g., warrior-systems)"
                value={brandSlug}
                onChange={(e) => setBrandSlug(e.target.value)}
                disabled={isAdding}
                className="flex-1"
              />

              <Button
                onClick={handleAddBrand}
                disabled={!brandName.trim() || !brandSlug.trim() || isAdding}
                className="gap-2"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add Brand
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assigned Brands List */}
      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-lg">
            Assigned Brands ({assignedBrands.length})
          </CardTitle>
          <CardDescription>
            Brands currently assigned to this company
          </CardDescription>
        </CardHeader>
        <CardContent>
          {assignedBrands.length === 0 ? (
            <div className="flex min-h-[150px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
              <p className="text-sm font-medium text-slate-700">
                No brands assigned yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Add a brand to get started
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Brand Name</TableHead>
                    <TableHead>Brand Slug</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignedBrands.map((companyBrand) => (
                    <TableRow key={companyBrand.id}>
                      <TableCell className="font-medium text-slate-900">
                        {companyBrand.brand_name}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 font-mono">
                        {companyBrand.brand_slug}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {new Date(companyBrand.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveBrand(companyBrand.id)}
                          disabled={assignedBrands.length === 1}
                          className={cn(
                            "gap-1 text-red-600 hover:bg-red-50 hover:text-red-700",
                            assignedBrands.length === 1 &&
                              "opacity-50 cursor-not-allowed",
                          )}
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-slate-500">
        Each company can have multiple custom brands. Enter the brand name and slug to add a new brand.
      </p>
    </div>
  )
}
