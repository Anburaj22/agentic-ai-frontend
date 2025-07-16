"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/logo"

import loginBg from "../public/assets/login_bg.png"
import poweredBy from "../public/assets/powered_by_apexon.svg"

export default function LoginPage() {
  const [isLoading, setIsLoading] = React.useState(false)
  const router = useRouter()

  // Force light theme on login page
  useEffect(() => {
    // Remove dark theme and force light theme
    document.documentElement.classList.remove("dark")
    document.documentElement.classList.add("light")

    // Also set the data-theme attribute for additional theme control
    document.documentElement.setAttribute("data-theme", "light")

    // Clean up function - don't reset theme to avoid flashing
    return () => {
      // Intentionally empty - let other pages handle their own theme
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    /** Simulate authentication delay: start */
    // await new Promise((resolve) => setTimeout(resolve, 1000))
    /** Simulate authentication delay: end */

    // router.push("/workflows")
    // setIsLoading(false)

    // const domain = 'https://genesys-user-pool.auth.us-east-1.amazoncognito.com'
    // const clientId = '5g5rdsptri79c98pvuopsv5dta'
    // const redirectUri = 'https://dev3.agentic-ai.apexon-genesys.com/idpresponse'
    // const scope = 'openid profile email'

    const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN!
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!
    const redirectUri = process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI!
    const scope = process.env.NEXT_PUBLIC_COGNITO_SCOPE!

    if (!domain || !clientId || !redirectUri || !scope) {
      console.log("Missing environment variables for Cognito configuration")
      setIsLoading(false)
      return
    }

    const loginUrl = `${domain}/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`
    window.location.href = loginUrl
  }

  return (
    <div className="min-h-screen flex justify-center light" style={{ colorScheme: "light" }}>
      <div className="left w-1/3 relative">
        <div className="shade absolute top-0 bg-blue-700 h-full z-10 w-full opacity-75"></div>
        <div className="powered text-sm text-white flex justify-center gap-2 items-center absolute top-0 left-0 p-2 z-20">
          <span>powered by</span>
          <img src={poweredBy.src} alt="Powered by Apexon" />
        </div>
        <img src={loginBg.src} className="w-full h-full object-cover" alt="login-bg" />
      </div>
      <div className="right w-2/3 flex flex-col items-center justify-center bg-white text-gray-900">
        <div className="flex flex-col justify-center" style={{ flexGrow: "1" }}>
          <div className="mt-5 flex justify-center">
            <Logo />
          </div>
          <CardHeader>
            <CardTitle className="text-2xl text-center text-gray-900">Welcome to AgenticAI</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardFooter className="text-center flex justify-center">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </CardFooter>
          </form>
        </div>
        <div className="copyright text-xs p-2 text-gray-600">
          Apexon, Copyright © 2025 Apexon India Pvt. Ltd. All rights reserved.
        </div>
      </div>
    </div>
  )
}
