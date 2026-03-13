import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function SuperAdminHomePage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-semibold tracking-tight text-slate-900">Super Admin Dashboard</h2>
				<p className="mt-1 text-sm text-slate-600">Platform-level controls and tenant management.</p>
			</div>

			<Card className="border-slate-200 bg-white">
				<CardHeader>
					<CardTitle>Quick Actions</CardTitle>
					<CardDescription>Start by creating or managing companies.</CardDescription>
				</CardHeader>
				<CardContent>
					<Button asChild>
						<Link href="/superadmin/companies">Go to Companies</Link>
					</Button>
				</CardContent>
			</Card>
		</div>
	)
}

