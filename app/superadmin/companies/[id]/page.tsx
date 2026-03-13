import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createSupabaseServerClient, getSupabaseAccessTokenFromCookies } from "@/lib/supabase/server"
import { CompanyBrandsManagement } from "@/components/superadmin/company-brands-management"

type CompanyRow = {
	id: string
	name: string
	subdomain?: string | null
	domain?: string | null
	slug?: string | null
	status: string | null
	created_at: string
}

type CompanyDetailPageProps = {
	params: Promise<{ id: string }>
}

async function getCompanyDetails(companyId: string) {
	const accessToken = await getSupabaseAccessTokenFromCookies()
	if (!accessToken) return null

	const supabase = createSupabaseServerClient()
	const { data: authUserData } = await supabase.auth.getUser(accessToken)

	if (!authUserData?.user) return null

	// Verify super_admin role
	const { data: userRole } = await supabase
		.from("users")
		.select("role")
		.eq("id", authUserData.user.id)
		.single()

	if (userRole?.role !== "super_admin") return null

	// Fetch company details
	const { data: company } = await supabase
		.from("companies")
		.select("*")
		.eq("id", companyId)
		.single()

	return company as CompanyRow | null
}

export default async function SuperAdminCompanyDetailPage({ params }: CompanyDetailPageProps) {
	const { id } = await params
	const company = await getCompanyDetails(id)

	if (!company) {
		return (
			<div className="space-y-6">
				<div className="flex items-center gap-2">
					<Button variant="ghost" asChild className="gap-2">
						<Link href="/superadmin/companies">
							<ArrowLeft className="h-4 w-4" />
							Back to Companies
						</Link>
					</Button>
				</div>

				<Card className="border-rose-200 bg-rose-50">
					<CardHeader>
						<CardTitle className="text-rose-900">Company Not Found</CardTitle>
					</CardHeader>
					<CardContent className="text-sm text-rose-700">
						The company you're looking for doesn't exist or you don't have permission to access it.
					</CardContent>
				</Card>
			</div>
		)
	}

	const formatCreatedDate = (dateValue: string) => {
		const date = new Date(dateValue)
		if (Number.isNaN(date.getTime())) return "—"
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		})
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="ghost" asChild className="gap-2">
					<Link href="/superadmin/companies">
						<ArrowLeft className="h-4 w-4" />
						Back to Companies
					</Link>
				</Button>
			</div>

			<div>
				<h2 className="text-2xl font-semibold tracking-tight text-slate-900">{company.name}</h2>
				<p className="mt-1 text-sm text-slate-600">Manage company settings, brands, and configuration.</p>
			</div>

			{/* Company Info Card */}
			<Card className="border-slate-200 bg-white">
				<CardHeader>
					<CardTitle className="text-lg">Company Information</CardTitle>
					<CardDescription>Basic details about this company</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div>
							<p className="text-sm font-medium text-slate-600">Company Name</p>
							<p className="mt-1 text-sm text-slate-900">{company.name}</p>
						</div>
						<div>
							<p className="text-sm font-medium text-slate-600">Company ID</p>
							<p className="mt-1 text-sm font-mono text-slate-700">{company.id}</p>
						</div>
						<div>
							<p className="text-sm font-medium text-slate-600">Slug</p>
							<p className="mt-1 text-sm text-slate-700">{company.slug || "—"}</p>
						</div>
						<div>
							<p className="text-sm font-medium text-slate-600">Subdomain</p>
							<p className="mt-1 text-sm text-slate-700">{company.subdomain || company.domain || "—"}</p>
						</div>
						<div>
							<p className="text-sm font-medium text-slate-600">Status</p>
							<p className="mt-1 text-sm capitalize text-slate-700">
								{typeof company.status === "string" ? company.status : "Unknown"}
							</p>
						</div>
						<div>
							<p className="text-sm font-medium text-slate-600">Created Date</p>
							<p className="mt-1 text-sm text-slate-700">{formatCreatedDate(company.created_at)}</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Brands Management Section */}
			<CompanyBrandsManagement companyId={id} />
		</div>
	)
}

