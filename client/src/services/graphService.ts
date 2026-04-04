import type { ConditionalAccessPolicy } from '@/types/policy'

const API_BASE = '/api'

/**
 * Fetches all Conditional Access policies from the FastAPI backend.
 * The backend proxies the request to Microsoft Graph using its own
 * ClientSecretCredential (app-level auth, Policy.Read.All scope).
 *
 * @param accessToken - MSAL-issued access token forwarded to the backend
 *                      so the middleware can verify the request is authenticated.
 */
export async function fetchPolicies(accessToken: string): Promise<ConditionalAccessPolicy[]> {
  const response = await fetch(`${API_BASE}/policies`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Failed to fetch policies: ${response.status} ${errorBody}`)
  }

  return response.json() as Promise<ConditionalAccessPolicy[]>
}
