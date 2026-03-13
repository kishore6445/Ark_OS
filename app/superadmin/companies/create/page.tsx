import Link from "next/link"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createSupabaseServerClient, getSupabaseAccessTokenFromCookies } from "@/lib/supabase/server"

type SearchParams = Promise<{
	error?: string
	success?: string
}>

async function requireSuperAdmin() {
	const accessToken = await getSupabaseAccessTokenFromCookies()
	if (!accessToken) return null

	const supabase = createSupabaseServerClient()
	const { data: authUserData, error: authUserError } = await supabase.auth.getUser(accessToken)

	if (authUserError || !authUserData?.user) {
		return null
	}

	const { data: profileById } = await supabase
		.from("users")
		.select("role, email")
		.eq("id", authUserData.user.id)
		.maybeSingle()

	let profile = profileById

	if (!profile && authUserData.user.email) {
		const { data: profileByEmail } = await supabase
			.from("users")
			.select("role, email")
			.eq("email", authUserData.user.email)
			.maybeSingle()
		profile = profileByEmail
	}

	const normalizedRole = typeof profile?.role === "string" ? profile.role.trim().toLowerCase() : ""
	const isSuperAdmin =
		normalizedRole === "super_admin" || normalizedRole === "super admin" || normalizedRole === "superadmin"

	if (!profile || !isSuperAdmin) {
		return null
	}

	return supabase
}

function toSlug(value: string) {
	const normalized = value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-+|-+$/g, "")

	return normalized || `company-${Date.now()}`
}

async function generateUniqueCompanySlug(
	supabase: ReturnType<typeof createSupabaseServerClient>,
	seed: string,
) {
	const baseSlug = toSlug(seed)

	for (let index = 0; index < 50; index += 1) {
		const candidate = index === 0 ? baseSlug : `${baseSlug}-${index + 1}`
		const { data, error } = await supabase.from("companies").select("id").eq("slug", candidate).maybeSingle()

		if (error) {
			const isMissingColumnError =
				error.code === "42703" || (typeof error.message === "string" && error.message.includes("column companies."))
			if (isMissingColumnError) {
				return candidate
			}
			return candidate
		}

		if (!data) {
			return candidate
		}
	}

	return `${baseSlug}-${Date.now()}`
}

async function insertCompany(
	supabase: ReturnType<typeof createSupabaseServerClient>,
	name: string,
	identifier: string,
	status: "active" | "inactive",
) {
	const generatedSlug = await generateUniqueCompanySlug(supabase, identifier || name)

	const payloads = identifier
		? [
				{ name, status, slug: generatedSlug, subdomain: identifier },
				{ name, status, slug: generatedSlug, domain: identifier },
				{ name, status, slug: generatedSlug },
				{ name, status },
			]
		: [{ name, status, slug: generatedSlug }, { name, status }]

	let lastErrorMessage = "Unable to create company."

	for (const payload of payloads) {
		const { data, error } = await supabase.from("companies").insert(payload).select("id").single()

		if (!error) {
			return { ok: true as const, companyId: data?.id as string | undefined }
		}

		const isMissingColumnError =
			error.code === "42703" || (typeof error.message === "string" && error.message.includes("column companies."))

		if (!isMissingColumnError) {
			return { ok: false as const, message: error.message }
		}

		lastErrorMessage = error.message
	}

	return { ok: false as const, message: lastErrorMessage }
}

async function createCompanyOwnerUser(
	supabase: ReturnType<typeof createSupabaseServerClient>,
	companyId: string,
	ownerName: string,
	ownerEmail: string,
	redirectBase: string | null,
) {
	const inviteOptions: { data: { name: string }; redirectTo?: string } = {
		data: { name: ownerName },
	}

	if (redirectBase) {
		inviteOptions.redirectTo = `${redirectBase.replace(/\/$/, "")}/auth/callback`
	}

	const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(ownerEmail, inviteOptions)

	if (inviteError || !inviteData?.user) {
		return {
			ok: false as const,
			message: inviteError?.message || "Unable to create owner auth account.",
		}
	}

	const { error: profileError } = await supabase.from("users").insert({
		id: inviteData.user.id,
		name: ownerName,
		email: ownerEmail,
		role: "company_admin",
		status: "invited",
		company_id: companyId,
	})

	if (profileError) {
		return {
			ok: false as const,
			message: profileError.message,
		}
	}

	return { ok: true as const }
}

async function resolveInviteRedirectBase() {
	const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
	if (configuredSiteUrl) {
		return configuredSiteUrl
	}

	const requestHeaders = await headers()
	const origin = requestHeaders.get("origin")
	if (origin) {
		return origin
	}

	const forwardedHost = requestHeaders.get("x-forwarded-host")
	const host = forwardedHost || requestHeaders.get("host")
	if (!host) {
		return null
	}

	const protocol = requestHeaders.get("x-forwarded-proto") || "https"
	return `${protocol}://${host}`
}

async function createCompanyAction(formData: FormData) {
	"use server"

	const supabase = await requireSuperAdmin()
	if (!supabase) {
		redirect("/dashboard")
	}

	const name = String(formData.get("name") || "").trim()
	const identifier = String(formData.get("subdomain") || "").trim().toLowerCase()
	const ownerName = String(formData.get("ownerName") || "").trim()
	const ownerEmail = String(formData.get("ownerEmail") || "").trim().toLowerCase()
	const rawStatus = String(formData.get("status") || "active").trim().toLowerCase()
	const status = rawStatus === "inactive" ? "inactive" : "active"

	if (!name) {
		redirect("/superadmin/companies/create?error=Company%20name%20is%20required")
	}

	if (!ownerName) {
		redirect("/superadmin/companies/create?error=Owner%20name%20is%20required")
	}

	if (!ownerEmail) {
		redirect("/superadmin/companies/create?error=Owner%20email%20is%20required")
	}

	const result = await insertCompany(supabase, name, identifier, status)

	if (!result.ok) {
		redirect(`/superadmin/companies/create?error=${encodeURIComponent(result.message)}`)
	}

	const inviteRedirectBase = await resolveInviteRedirectBase()
	const ownerResult = await createCompanyOwnerUser(
		supabase,
		result.companyId,
		ownerName,
		ownerEmail,
		inviteRedirectBase,
	)

	if (!ownerResult.ok) {
		redirect(`/superadmin/companies/create?error=${encodeURIComponent(ownerResult.message)}`)
	}

	revalidatePath("/superadmin/companies")
	redirect("/superadmin/companies?success=created")
}

export default async function SuperAdminCreateCompanyPage({
	searchParams,
}: {
	searchParams: SearchParams
}) {
	const params = await searchParams

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-semibold tracking-tight text-slate-900">Create Company</h2>
				<p className="mt-1 text-sm text-slate-600">Add a new tenant to the platform.</p>
			</div>

			<Card className="border-slate-200 bg-white">
				<CardHeader>
					<CardTitle>Company Details</CardTitle>
					<CardDescription>Provide the company information to create a tenant record.</CardDescription>
				</CardHeader>
				<CardContent>
					<form action={createCompanyAction} className="space-y-5">
						{params.error ? (
							<div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
								{params.error}
							</div>
						) : null}

						<div className="space-y-2">
							<label htmlFor="name" className="text-sm font-medium text-slate-700">
								Company Name
							</label>
							<input
								id="name"
								name="name"
								required
								placeholder="Acme Inc"
								className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-slate-400"
							/>
						</div>

						<div className="space-y-2">
							<label htmlFor="subdomain" className="text-sm font-medium text-slate-700">
								Subdomain (Optional)
							</label>
							<input
								id="subdomain"
								name="subdomain"
								placeholder="acme"
								className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-slate-400"
							/>
							<p className="text-xs text-slate-500">
								Optional. Slug is auto-generated from this value or company name.
							</p>
						</div>

						<div className="space-y-2">
							<label htmlFor="ownerName" className="text-sm font-medium text-slate-700">
								Company Admin Name
							</label>
							<input
								id="ownerName"
								name="ownerName"
								required
								placeholder="Jane Doe"
								className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-slate-400"
							/>
						</div>

						<div className="space-y-2">
							<label htmlFor="ownerEmail" className="text-sm font-medium text-slate-700">
								Company Admin Email
							</label>
							<input
								id="ownerEmail"
								name="ownerEmail"
								type="email"
								required
								placeholder="owner@company.com"
								className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-slate-400"
							/>
							<p className="text-xs text-slate-500">
								This email receives the invite and is created as the company_admin user.
							</p>
						</div>

						<div className="space-y-2">
							<label htmlFor="status" className="text-sm font-medium text-slate-700">
								Status
							</label>
							<select
								id="status"
								name="status"
								defaultValue="active"
								className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-slate-400"
							>
								<option value="active">Active</option>
								<option value="inactive">Inactive</option>
							</select>
						</div>

						<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
							<Button type="button" variant="outline" asChild>
								<Link href="/superadmin/companies">Cancel</Link>
							</Button>
							<Button type="submit">Create Company</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}

