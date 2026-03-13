import type { ReactNode } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
	Building2,
	LayoutDashboard,
	Menu,
	Settings,
	Shield,
	Users,
	ClipboardList,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { createSupabaseServerClient, getSupabaseAccessTokenFromCookies } from "@/lib/supabase/server"
import { SuperAdminLogoutButton } from "@/components/superadmin-logout-button"

const navItems = [
	{ href: "/superadmin", label: "Dashboard", icon: LayoutDashboard },
	{ href: "/superadmin/companies", label: "Companies", icon: Building2 },
	{ href: "/superadmin/users", label: "Users", icon: Users },
	{ href: "/superadmin/logs", label: "Platform Logs", icon: ClipboardList },
	{ href: "/superadmin/settings", label: "Settings", icon: Settings },
]

function SuperAdminSidebar() {
	return (
		<div className="flex h-full flex-col bg-white">
			<div className="flex h-16 items-center gap-2 border-b px-4">
				<div className="rounded-lg bg-slate-900 p-2 text-white">
					<Shield className="h-4 w-4" />
				</div>
				<div>
					<p className="text-sm font-semibold text-slate-900">Platform Admin</p>
					<p className="text-xs text-slate-500">Super Admin Panel</p>
				</div>
			</div>
			<nav className="flex-1 space-y-1 p-3" aria-label="Super admin navigation">
				{navItems.map((item) => {
					const Icon = item.icon

					return (
						<Link
							key={item.href}
							href={item.href}
							className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
						>
							<Icon className="h-4 w-4" />
							<span>{item.label}</span>
						</Link>
					)
				})}
			</nav>
		</div>
	)
}

export default async function SuperAdminLayout({ children }: { children: ReactNode }) {
	const accessToken = await getSupabaseAccessTokenFromCookies()

	if (!accessToken) {
		redirect("/dashboard")
	}

	const supabase = createSupabaseServerClient()
	const { data: authUserData, error: authUserError } = await supabase.auth.getUser(accessToken)

	if (authUserError || !authUserData?.user) {
		redirect("/dashboard")
	}

	const { data: profileById, error: profileByIdError } = await supabase
		.from("users")
		.select("email, role")
		.eq("id", authUserData.user.id)
		.maybeSingle()

	if (profileByIdError) {
		redirect("/dashboard")
	}

	let profile = profileById

	if (!profile && authUserData.user.email) {
		const { data: profileByEmail, error: profileByEmailError } = await supabase
			.from("users")
			.select("email, role")
			.eq("email", authUserData.user.email)
			.maybeSingle()

		if (profileByEmailError) {
			redirect("/dashboard")
		}

		profile = profileByEmail
	}

	const normalizedRole = typeof profile?.role === "string" ? profile.role.trim().toLowerCase() : ""
	const isSuperAdmin =
		normalizedRole === "super_admin" ||
		normalizedRole === "super admin" ||
		normalizedRole === "superadmin"

	if (!profile || !isSuperAdmin) {
		redirect("/dashboard")
	}

	const adminEmail = profile.email || authUserData.user.email || "superadmin"

	return (
		<div className="min-h-screen bg-slate-50">
			<div className="flex min-h-screen">
				<aside className="hidden w-64 border-r border-slate-200 md:block">
					<SuperAdminSidebar />
				</aside>

				<div className="flex min-w-0 flex-1 flex-col">
					<header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
						<div className="flex items-center gap-3">
							<Sheet>
								<SheetTrigger asChild>
									<Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation">
										<Menu className="h-5 w-5" />
									</Button>
								</SheetTrigger>
								<SheetContent side="left" className="w-72 p-0">
									<SheetHeader className="sr-only">
										<SheetTitle>Super admin navigation</SheetTitle>
									</SheetHeader>
									<SuperAdminSidebar />
								</SheetContent>
							</Sheet>
							<h1 className="text-base font-semibold text-slate-900 sm:text-lg">Super Admin</h1>
						</div>

						<div className="flex items-center gap-3">
							<p className="hidden text-sm text-slate-600 sm:block">{adminEmail}</p>
							<SuperAdminLogoutButton />
						</div>
					</header>

					<main className="flex-1 p-4 sm:p-6 lg:p-8">
						<div className="mx-auto w-full max-w-7xl">
							{children}
						</div>
					</main>
				</div>
			</div>
			<Separator className="hidden" />
		</div>
	)
}
