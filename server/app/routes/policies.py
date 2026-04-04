"""
Conditional Access policies route.
"""
from fastapi import APIRouter, Depends, HTTPException, status

from app.middleware.auth import require_bearer_token
from app.controllers.graph_controller import get_conditional_access_policies

router = APIRouter(tags=["policies"])


@router.get(
    "/policies",
    summary="List all Conditional Access policies",
    description=(
        "Returns all Microsoft Entra ID Conditional Access policies "
        "fetched from Microsoft Graph API v1.0. Requires a valid Bearer "
        "token in the Authorization header."
    ),
)
async def list_policies(
    _token: str = Depends(require_bearer_token),
) -> list[dict]:
    """
    GET /api/policies

    Protected endpoint — requires Authorization: Bearer <token>.
    The backend authenticates to Graph using its own ClientSecretCredential.
    """
    try:
        return await get_conditional_access_policies()
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error fetching policies: {exc}",
        ) from exc
