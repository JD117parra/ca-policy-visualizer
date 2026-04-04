import { useState, useEffect, useCallback } from 'react'
import { useMsal, useIsAuthenticated } from '@azure/msal-react'
import { fetchPolicies } from '@/services/graphService'
import type { ConditionalAccessPolicy } from '@/types/policy'

// openid + profile are sufficient for the backend to verify the user is
// authenticated. The backend calls Graph with its own ClientSecretCredential.
const LOGIN_REQUEST = {
  scopes: ['openid', 'profile'],
}

interface UsePoliciesResult {
  policies: ConditionalAccessPolicy[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useConditionalAccessPolicies(): UsePoliciesResult {
  const { instance, accounts } = useMsal()
  const isAuthenticated = useIsAuthenticated()

  const [policies, setPolicies] = useState<ConditionalAccessPolicy[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadPolicies = useCallback(async () => {
    if (!isAuthenticated || accounts.length === 0) return

    setIsLoading(true)
    setError(null)

    try {
      // Attempt silent token acquisition; fall back to popup on interaction required
      const tokenResponse = await instance
        .acquireTokenSilent({ ...LOGIN_REQUEST, account: accounts[0] })
        .catch(() => instance.acquireTokenPopup(LOGIN_REQUEST))

      const data = await fetchPolicies(tokenResponse.accessToken)
      setPolicies(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [instance, accounts, isAuthenticated])

  useEffect(() => {
    void loadPolicies()
  }, [loadPolicies])

  return { policies, isLoading, error, refetch: loadPolicies }
}
