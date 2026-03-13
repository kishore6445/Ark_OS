import Link from "next/link"
import { revalidatePath } from "next/cache"
import { Building2, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createSupabaseServerClient, getSupabaseAccessTokenFromCookies } from "@/lib/supabase/server"

type CompanyStatus = "active" | "inactive"

type CompanyRow = {
	id: string
	name: string
	subdomain?: string | null
	domain?: string | null
	slug?: string | null
	status: CompanyStatus | string | null
	created_at: string
}

async function requireSuperAdmin() {
	const accessToken = await getSupabaseAccessTokenFromCookies()
	if (!accessToken) return null

	const supabase = createSupabaseServerClient()
	const { data: authUserData, error: authUserError } = await supabase.auth.getUser(accessToken)

	if (authUserError || !authUserData?.user) {
		return null
	}

	const { data: profileById, error: profileByIdError } = await supabase
		.from("users")
		.select("role")
		.eq("id", authUserData.user.id)
		.maybeSingle()

	if (profileByIdError) {
		return null
	}

	let profile = profileById

	if (!profile && authUserData.user.email) {
		const { data: profileByEmail, error: profileByEmailError } = await supabase
			.from("users")
			.select("role")
			.eq("email", authUserData.user.email)
			.maybeSingle()

		if (profileByEmailError) {
			return null
		}

		profile = profileByEmail
	}

	const normalizedRole = typeof profile?.role === "string" ? profile.role.trim().toLowerCase() : ""

	if (!profile || normalizedRole !== "super_admin") {
		return null
	}

	return supabase
}

function formatCreatedDate(dateValue: string) {
	const date = new Date(dateValue)

	if (Number.isNaN(date.getTime())) {
		return "—"
	}

	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	})
}

async function updateCompanyStatus(formData: FormData) {
	"use server"

	const companyId = String(formData.get("companyId") || "")
	const nextStatus = String(formData.get("nextStatus") || "") as CompanyStatus

	if (!companyId || (nextStatus !== "active" && nextStatus !== "inactive")) {
		return
	}

	const supabase = await requireSuperAdmin()
	if (!supabase) {
		return
	}

	await supabase.from("companies").update({ status: nextStatus }).eq("id", companyId)

	revalidatePath("/superadmin/companies")
}

export default async function SuperAdminCompaniesPage({
	searchParams,
}: {
	searchParams: Promise<{ success?: string }>
}) {
	const supabase = await requireSuperAdmin()
	if (!supabase) {
		return null
	}

	const params = await searchParams

	const { data, error } = await supabase
		.from("companies")
		.select("*")
		.order("created_at", { ascending: false })

	const companies: CompanyRow[] = data || []

	return (
		<div className="space-y-6">
			{params.success === "created" ? (
				<div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
					Company created successfully.
				</div>
			) : null}

			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="space-y-1">
					<h2 className="text-2xl font-semibold tracking-tight text-slate-900">Companies</h2>
					<p className="text-sm text-slate-600">Manage tenants across the platform.</p>
				</div>

				<Button asChild className="w-full sm:w-auto">
					<Link href="/superadmin/companies/create" className="gap-2">
						<Plus className="h-4 w-4" />
						Create Company
					</Link>
				</Button>
			</div>

			<Card className="border-slate-200 bg-white">
				<CardHeader className="pb-3">
					<CardTitle className="text-base">Company Directory</CardTitle>
					<CardDescription>All registered companies and current status.</CardDescription>
				</CardHeader>

				<CardContent>
					{error ? (
						<div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
							Failed to load companies. {error.message}
						</div>
					) : companies.length === 0 ? (
						<div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
							<Building2 className="mb-3 h-5 w-5 text-slate-400" />
							<p className="text-sm font-medium text-slate-700">No companies found</p>
							<p className="mt-1 text-sm text-slate-500">Create your first company to get started.</p>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Company Name</TableHead>
									<TableHead>Subdomain</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Created Date</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{companies.map((company) => {
										const normalizedStatus =
											typeof company.status === "string" ? company.status.trim().toLowerCase() : ""
										const isActive = normalizedStatus === "active"
										const subdomainValue =
											company.subdomain || company.domain || company.slug || "—"

									return (
										<TableRow key={company.id}>
											<TableCell className="font-medium text-slate-900">{company.name}</TableCell>
											<TableCell className="text-slate-600">{subdomainValue}</TableCell>
											<TableCell>
												<Badge variant={isActive ? "default" : "secondary"}>
													{isActive ? "Active" : "Inactive"}
												</Badge>
											</TableCell>
											<TableCell className="text-slate-600">{formatCreatedDate(company.created_at)}</TableCell>
											<TableCell>
												<div className="flex items-center justify-end gap-2">
													<Button variant="ghost" size="sm" asChild>
														<Link href={`/superadmin/companies/${company.id}`}>View company</Link>
													</Button>

													{isActive ? (
														<form action={updateCompanyStatus}>
															<input type="hidden" name="companyId" value={company.id} />
															<input type="hidden" name="nextStatus" value="inactive" />
															<Button type="submit" size="sm" variant="outline">
																Disable company
															</Button>
														</form>
													) : (
														<form action={updateCompanyStatus}>
															<input type="hidden" name="companyId" value={company.id} />
															<input type="hidden" name="nextStatus" value="active" />
															<Button type="submit" size="sm" variant="outline">
																Activate company
															</Button>
														</form>
													)}
												</div>
											</TableCell>
										</TableRow>
									)
								})}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	)
}

