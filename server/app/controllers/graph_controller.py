"""
Microsoft Graph API controller for Conditional Access policies.

Uses azure-identity ClientSecretCredential (app-level auth) to acquire a token
scoped to Microsoft Graph, then calls the Conditional Access policies endpoint.
Pagination is handled automatically by following @odata.nextLink.
"""
import httpx
from azure.identity import ClientSecretCredential
from azure.core.exceptions import ClientAuthenticationError

from app.settings import get_settings

GRAPH_BASE_URL = "https://graph.microsoft.com/v1.0"
GRAPH_SCOPE = "https://graph.microsoft.com/.default"


def _get_credential() -> ClientSecretCredential:
    """Build a ClientSecretCredential from application settings."""
    settings = get_settings()
    return ClientSecretCredential(
        tenant_id=settings.tenant_id,
        client_id=settings.client_id,
        client_secret=settings.client_secret,
    )


async def get_conditional_access_policies() -> list[dict]:
    """
    Fetches all Conditional Access policies from Microsoft Graph.

    Returns the raw list of policy objects from the API response.
    Follows @odata.nextLink until all pages are retrieved.

    Raises:
        RuntimeError: If the credential cannot acquire a Graph token.
        httpx.HTTPStatusError: If the Graph API returns a non-2xx response.
    """
    credential = _get_credential()

    try:
        token = credential.get_token(GRAPH_SCOPE)
    except ClientAuthenticationError as exc:
        raise RuntimeError(f"Failed to acquire Graph token: {exc}") from exc

    headers = {
        "Authorization": f"Bearer {token.token}",
        "Content-Type": "application/json",
    }

    policies: list[dict] = []
    url: str | None = f"{GRAPH_BASE_URL}/identity/conditionalAccess/policies"

    async with httpx.AsyncClient(timeout=30.0) as client:
        while url:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            body = response.json()
            policies.extend(body.get("value", []))
            url = body.get("@odata.nextLink")

    return policies
