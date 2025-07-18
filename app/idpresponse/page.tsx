'use client'

import React from 'react'
import { useRouter , useSearchParams } from 'next/navigation'

import { exchangeCognitoToken } from './../../services/AuthServices'; // Adjust path as needed

let hasExchanged = false

export default function Idpresponse() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [accesToken, setAccessToken] = React.useState<string>('');

  React.useEffect(() => {
    if (hasExchanged) return
    hasExchanged = true
    
    const code = searchParams.get('code')

    if (!code) {
      setError('Authorization code not found in URL.')
      setLoading(false)
      return
    }

    const exchangeToken = async () => {
      try {
        const result = await exchangeCognitoToken(code);

        if (!result) throw new Error("No result from token exchange");

        const { user, tokens } = result;

        // Store tokens
        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('id_token', tokens.id_token);
        localStorage.setItem('refresh_token', tokens.refresh_token);

        // Store user info
        localStorage.setItem('user_email', user.email);
        localStorage.setItem('user_full_name', `${user.given_name} ${user.family_name}`);

        if (Array.isArray(user.groups) && user.groups.includes('AgenticAI_Admin')) {
          localStorage.setItem('is_agentic_admin', 'true');
        }

        setAccessToken(tokens.access_token);
        router.push('/workflows');
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Unexpected error occurred during token exchange.');
        // router.push('/');
      } finally {
        setLoading(false);
      }
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
