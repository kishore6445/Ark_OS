"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/browserclient"

export default function SignInPage() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    const inviteStatus = searchParams.get("invite")
    const errorParam = searchParams.get("error")
    if (errorParam) {
      setErrorMessage(errorParam)
      setSuccessMessage(null)
      return
    }
    if (inviteStatus === "success") {
      setSuccessMessage("Your account is activated. Please sign in to continue.")
      setErrorMessage(null)
    }
  }, [searchParams])

  // now returns the raw session object along with access token
  const signInViaServer = async (): Promise<{ accessToken: string; session: any }> => {
    const fallbackResponse = await fetch("/api/auth/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    const fallbackResult = await fallbackResponse.json().catch(() => null)
    console.log("[signin] server result", fallbackResult)

    if (!fallbackResponse.ok) {
      throw new Error(
        fallbackResult?.error || "Authentication service is unreachable. Please check your network and try again.",
      )
    }

    const accessToken =
      (typeof fallbackResult?.accessToken === "string" && fallbackResult.accessToken) ||
      (typeof fallbackResult?.access_token === "string" && fallbackResult.access_token) ||
      (typeof fallbackResult?.session?.access_token === "string" && fallbackResult.session.access_token) ||
      null

    if (!accessToken) {
      throw new Error("Authentication succeeded but no session token was returned.")
    }

    return { accessToken, session: fallbackResult.session || fallbackResult }
  }

  const completeSignIn = async (accessToken: string, sessionObj: any) => {
    try {
      console.log("[signin] setting sessionObj", sessionObj)
      // additionally set the session on the Supabase client so getSession() works
      try {
        console.log("[signin] cookies before setSession", document.cookie)
        const { data: setData, error: setError } = await supabase.auth.setSession(sessionObj)
        console.log("[signin] supabase.setSession returned", setData, setError)
        console.log("[signin] cookies after setSession", document.cookie)
      } catch (err) {
        console.warn("Unable to set supabase client session", err)
      }

      const sessionResponse = await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!sessionResponse.ok) {
        const result = await sessionResponse.json().catch(() => null)
        setErrorMessage(result?.error || "Unable to establish secure session. Please try again.")
        setIsLoading(false)
        return
      }

      const targetResponse = await fetch("/api/auth/post-login-target", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      //debugger;

      console.log("Post-login target response:", targetResponse)
      if (!targetResponse.ok) {
        const result = await targetResponse.json().catch(() => null)
        console.log("Target response error:", result)
        setErrorMessage(result?.error || "Unable to determine redirect path. Please try again.")
        setIsLoading(false)
        return
      }

      const result = await targetResponse.json().catch(() => null)
      console.log("Post-login target result:", result)
      console.log("User role from API:", result?.role)
      const redirectTo = typeof result?.redirectTo === "string" ? result.redirectTo : "/dashboard"
      console.log("Redirecting to:", redirectTo)
      window.location.replace(redirectTo)
    } catch {
      setErrorMessage("Unable to complete sign in right now. Please try again.")
      setIsLoading(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)
    setIsLoading(true)

    let accessToken: string
    let sessionObj: any

    try {
      const res = await signInViaServer()
      accessToken = res.accessToken
      sessionObj = res.session
    } catch (error) {
      const message = error instanceof Error ? error.message : "Authentication service is unreachable. Please check your network and try again."
      setErrorMessage(message)
      setIsLoading(false)
      return
    }

    await completeSignIn(accessToken, sessionObj)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl">
          <div className="space-y-3 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Welcome back</p>
            <h1 className="text-3xl font-semibold">Sign in</h1>
            <p className="text-sm text-slate-300">
              Continue to your ArkMedis Operating System workspace.
            </p>
          </div>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm text-slate-200" htmlFor="email">
                Work email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-white/30 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-200" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-white/30 focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-slate-950" />
                Remember me
              </label>
              <button type="button" className="text-white/80 hover:text-white">
                Forgot password?
              </button>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
            {errorMessage ? (
              <p className="text-sm text-rose-300">{errorMessage}</p>
            ) : null}
            {successMessage ? (
              <p className="text-sm text-emerald-300">{successMessage}</p>
            ) : null}
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            New here?{" "}
            <Link href="/signup" className="font-semibold text-white hover:text-slate-200">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
