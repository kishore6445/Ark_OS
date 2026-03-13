import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-lg font-semibold">
            AO
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-300">ArkMedis</p>
            <p className="text-lg font-semibold">Operating System</p>
          </div>
        </div>
        <nav className="flex items-center gap-3">
          <Link
            href="/signin"
            className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/5"
          >
            Sign in_test
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
          >
            Sign up
          </Link>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid w-full max-w-6xl gap-12 px-6 pb-16 pt-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-300">
              The modern operating system
            </div>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              Align leadership, execution, and growth in one intelligent workspace.
            </h1>
            <p className="text-lg text-slate-300">
              ArkMedis OS gives your teams a single source of truth for priorities, daily
              execution, and accountability. Launch in minutes and keep every department
              aligned to the same outcomes.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/signup"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
              >
                Create your workspace
              </Link>
              <Link
                href="/signin"
                className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/5"
              >
                Sign in to your account
              </Link>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                SOC2-ready security
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-sky-400" />
                Real-time analytics
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6 shadow-2xl">
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Today</p>
                <h2 className="mt-3 text-2xl font-semibold">Execution pulse</h2>
                <p className="mt-2 text-sm text-slate-300">
                  87% of commitments on track. 12 wins celebrated across Sales, R&D, and Ops.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    title: "Leadership alignment",
                    detail: "Weekly objectives synced across 6 departments.",
                  },
                  {
                    title: "Daily cadence",
                    detail: "Standups, scorecards, and blockers in one place.",
                  },
                  {
                    title: "Company scorecard",
                    detail: "Track WIGs, KPIs, and initiatives in real time.",
                  },
                  {
                    title: "Team accountability",
                    detail: "Owners, due dates, and momentum visible to all.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="mt-2 text-xs text-slate-300">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 pb-20">
          <div className="grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 lg:grid-cols-3">
            {["Launch in days", "Built for leadership teams", "Designed for focus"].map((title) => (
              <div key={title} className="space-y-3">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm text-slate-300">
                  Move faster with pre-built dashboards, role-based views, and instant clarity
                  on what matters most.
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-4 px-6 py-8 text-sm text-slate-400 sm:flex-row sm:items-center">
          <p>© 2026 ArkMedis. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/signin" className="hover:text-white">
              Sign in
            </Link>
            <Link href="/signup" className="hover:text-white">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
