'use client'

import React, { useEffect, useState } from 'react'
import { useRouter , useSearchParams } from 'next/navigation'

let hasExchanged = false // ✅ prevent duplicate calls

export default function Idpresponse() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (hasExchanged) return
    hasExchanged = true
    
    const code = searchParams.get('code')

    if (!code) {
      setError('Authorization code not found in URL.')
      setLoading(false)
      return
    }

    const exchangeToken = async () => {
      // const clientId = '5g5rdsptri79c98pvuopsv5dta'
      // const clientSecret = '1a7u8tlbqhgo625ihqofm512mfm7vuprjkrkh8oi0q3cpft6h4mn'
      // const redirectUri = 'https://dev3.agentic-ai.apexon-genesys.com/idpresponse'
      // const domain = 'https://genesys-user-pool.auth.us-east-1.amazoncognito.com'

      const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!
      const clientSecret = process.env.NEXT_PUBLIC_COGNITO_CLIENT_SECRET!
      const redirectUri = process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI!
      const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN!

      const basicAuth = btoa(`${clientId}:${clientSecret}`)

      const body = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: clientId
      })

      if (!clientId || !clientSecret || !redirectUri || !domain) {
        console.log("Missing environment variables for Cognito configuration")
        setError('Configuration error. Please check your environment variables.')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`${domain}/oauth2/token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${basicAuth}`,
          },
          body
        })

        const data = await response.json()

        if (response.ok && data.access_token) {

          // Store tokens securely (e.g., in localStorage or cookies)
          localStorage.setItem('access_token', data.access_token)
          localStorage.setItem('id_token', data.id_token)
          localStorage.setItem('refresh_token', data.refresh_token)

          // Redirect to your app's main page
          // setTimeout(() => {
          //   router.push('/workflows')
          // }, 100) // 100–300ms may help

          router.push('/workflows')
        } else {
          setError(data.error_description || 'Failed to retrieve tokens.')
          // router.push('/')
        }
      } catch (err) {
        console.log(err)
        setError('An unexpected error occurred while fetching tokens.')
        // router.push('/')
      }

      setLoading(false)
    }

    exchangeToken()
  }, [searchParams, router])

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center">
        <svg
          className="animate-spin h-10 w-10 text-blue-500 mx-auto mb-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>
        <p className="text-lg text-gray-600">Logging you in...</p>
      </div>
    </div>
  )

  if (error) {
    console.log(error)
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }
}
