import type { ConditionalAccessPolicy } from '@/types/policy'
import { policiesArraySchema } from '@/schemas/policy'

const API_BASE = '/api'

/**
 * Fetches all Conditional Access policies from the FastAPI backend.
 * The backend proxies the request to Microsoft Graph using its own
 * ClientSecretCredential (app-level auth, Policy.Read.All scope).
 *
 * Validates the response shape at runtime with Zod before returning.
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
    throw new Error(`Failed to fetch policies (${response.status})`)
  }

  const data: unknown = await response.json()
  return policiesArraySchema.parse(data) as ConditionalAccessPolicy[]
}
