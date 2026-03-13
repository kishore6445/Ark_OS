import { redirect } from "next/navigation"
import { createSupabaseServerClient, getSupabaseAccessTokenFromCookies } from "@/lib/supabase/server"

type UserRole = "super_admin" | "company_admin" | "member" | null

function shouldRedirectToSetPassword(status: unknown) {
	const normalizedStatus = typeof status === "string" ? status.trim().toLowerCase() : ""
	return normalizedStatus === "invited"
}

export async function redirectAfterLogin() {
	const accessToken = await getSupabaseAccessTokenFromCookies()

	if (!accessToken) {
		redirect("/signin")
	}

	const supabase = createSupabaseServerClient()
	const { data: authUserData, error: authUserError } = await supabase.auth.getUser(accessToken)

	if (authUserError || !authUserData?.user) {
		redirect("/signin")
	}

	const { data: profileById, error: profileByIdError } = await supabase
		.from("users")
		.select("role, email, status")
		.eq("id", authUserData.user.id)
		.maybeSingle()

	if (profileByIdError) {
		redirect("/dashboard")
	}

	let userProfile = profileById

	if (!userProfile && authUserData.user.email) {
		const { data: profileByEmail, error: profileByEmailError } = await supabase
			.from("users")
			.select("role, email, status")
			.eq("email", authUserData.user.email)
			.maybeSingle()

		if (profileByEmailError) {
			redirect("/dashboard")
		}

		userProfile = profileByEmail
	}

	if (!userProfile) {
		redirect("/dashboard")
	}

	if (shouldRedirectToSetPassword(userProfile.status)) {
		redirect("/set-password")
	}

	const role = (userProfile.role ?? null) as UserRole
	const normalizedRole =
		typeof role === "string" ? role.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") : ""
	const isSuperAdmin =
		normalizedRole === "super_admin" || normalizedRole === "superadmin"
	const isCompanyAdmin =
		normalizedRole === "company_admin" || normalizedRole === "companyadmin"

	if (isSuperAdmin) {
		redirect("/superadmin")
	}

	if (isCompanyAdmin) {
		redirect("/dashboard")
	}

	redirect("/dashboard")
}

