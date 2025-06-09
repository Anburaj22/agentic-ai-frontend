'use client'
import React from 'react'
import { useRouter, usePathname } from "next/navigation"

interface AuthContextType {
  isAuthenticated: boolean
  accessToken: string | null
  logout: () => void
}

const AuthContext = React.createContext<AuthContextType>({
  isAuthenticated: false,
  accessToken: null,
  logout: () => {},
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessToken, setAccessToken] = React.useState<string | null>(null)
  const [initializing, setInitializing] = React.useState(true)
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)
  const router = useRouter()
  const pathname = usePathname()

  /** Define public paths that do not require authentication */
  const publicPaths = ["/", "/idpresponse"]
  const isPublicPage = publicPaths.includes(pathname)

  const isTokenExpired = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      const expiry = payload.exp * 1000 // convert to ms
      return Date.now() > expiry
    } catch (e) {
      console.error("Invalid access token", e)
      return true
    }
  }

  const refreshAccessToken = async (refreshToken: string) => {
    if (!refreshToken) return logout()

    // const clientId = '5g5rdsptri79c98pvuopsv5dta'
    // const clientSecret = '1a7u8tlbqhgo625ihqofm512mfm7vuprjkrkh8oi0q3cpft6h4mn'
    // const domain = 'https://genesys-user-pool.auth.us-east-1.amazoncognito.com'

    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!
    const clientSecret = process.env.NEXT_PUBLIC_COGNITO_CLIENT_SECRET!
    const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN!

    const authHeader = 'Basic ' + btoa(`${clientId}:${clientSecret}`)

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      refresh_token: refreshToken
    })

    const res = await fetch(`${domain}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: authHeader,
      },
      body,
    })

    const data = await res.json()
    if (data.access_token) {
      console.log('Access token refreshed!')
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token || refreshToken)
      localStorage.setItem('id_token', data.id_token || '')

      setAccessToken(data.access_token)
      setIsAuthenticated(true)
    } else {
      logout()
    }
  }

  const logout = async () => {
    const refreshToken = localStorage.getItem("refresh_token")

    // const clientId = '5g5rdsptri79c98pvuopsv5dta'
    // const clientSecret = '1a7u8tlbqhgo625ihqofm512mfm7vuprjkrkh8oi0q3cpft6h4mn'
    // const cognitoDomain = 'https://genesys-user-pool.auth.us-east-1.amazoncognito.com'

    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!
    const clientSecret = process.env.NEXT_PUBLIC_COGNITO_CLIENT_SECRET!
    const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN!

    if (refreshToken) {
      const authHeader = btoa(`${clientId}:${clientSecret}`)
      const body = new URLSearchParams({
        token: refreshToken,
        token_type_hint: "refresh_token",
      })

      try {
        const response = await fetch(`${cognitoDomain}/oauth2/revoke`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${authHeader}`,
          },
          body: body.toString(),
        })

        if (!response.ok) {
          console.log("Failed to revoke token:", await response.text())
        }
      } catch (error) {
        console.log("Logout error:", error)
      }
    } else {
      console.log("No refresh token found, skipping revocation.")
    }

    // Clean up localStorage
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('id_token')
    setAccessToken(null)
    setIsAuthenticated(false)
    router.push("/") // redirect to login
  }

  React.useEffect(() => {
    if (isPublicPage) {
      setInitializing(false)
      return
    }

    const checkAndRefreshToken = async () => {
      if (pathname === '/idpresponse') {
        /** Skip check entirely while we're on the idpresponse page */
        setInitializing(false)
        return
      }

      const accessToken = localStorage.getItem("access_token")
      const refreshToken = localStorage.getItem("refresh_token")

      if (!accessToken || !refreshToken) {
        logout()
        return
      }

      const isExpired = isTokenExpired(accessToken)

      if (isExpired) {
        await refreshAccessToken(refreshToken)
      } else {
        setAccessToken(accessToken)
        setIsAuthenticated(true)
      }

      setInitializing(false)
    }

    checkAndRefreshToken()

    // Only run check on protected routes
    if (!isPublicPage) {
      checkAndRefreshToken()
       // Then run every minute
      const interval = setInterval(checkAndRefreshToken, 60 * 1000)
      return () => clearInterval(interval)
    }
    
  }, [pathname])

  React.useEffect(() => {
    if (!initializing) {
      const token = localStorage.getItem('access_token')
      setAccessToken(token)
    }
  }, [initializing])

  if (initializing && pathname === '/idpresponse') {
    return (
      <div className="h-screen flex items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-blue-600" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
        <span className="ml-2 text-gray-600 text-lg">Loading...</span>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, accessToken, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = React.useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}