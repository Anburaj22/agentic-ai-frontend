"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  // const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token")

    if (!accessToken) {
      router.push("/") // Redirect to login
    } else {
      // setIsLoading(false)
    }
  }, [router])

  // if (isLoading) return <div>Loading...</div>

  return <>{children}</>
}
