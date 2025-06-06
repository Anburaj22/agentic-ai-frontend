"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Grid2X2 as Grid } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/logo"

import loginBg from '../public/assets/login_bg.png';
import poweredBy from '../public/assets/powered_by_apexon.svg';

export default function LoginPage() {
  const [isLoading, setIsLoading] = React.useState(false)
  const router = useRouter()

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
    alert(loginUrl)
    window.location.href = loginUrl
  }

  return (
    <div className="min-h-screen flex justify-center">

      <div className="left w-1/2">
        <div
          className="powered"
          style={{
            fontSize: '10px',
            color: '#fff',
            display: 'flex',
            gap: '10px',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            top: '0',
            left: '0',
            padding: '10px 0 0 10px'
          }}
        >
          <span>powered by</span>
          <img src={poweredBy.src} />
        </div>
        <img src={loginBg.src} className="w-full h-full object-cover" alt="login-bg" />
      </div>
      <div className="right w-1/2 flex items-center justify-center">
        <div className="flex flex-col">
          <div className="mt-5 flex justify-center">
            <Logo />
          </div>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Welcome to AgenticAI</CardTitle>
            <CardDescription className="text-center">Login into your account</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardFooter>
              <Button type="submit" className="w-full bg-crew hover:bg-crew-dark" disabled={isLoading}>
                <Grid /> Login with Apexon Account
              </Button>
            </CardFooter>
          </form>
        </div>
      </div>
    </div>
  )
}
