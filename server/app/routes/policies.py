"""
Conditional Access policies route.
"""
import logging

from fastapi import APIRouter, Depends, HTTPException, Request, status
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.middleware.auth import require_bearer_token
from app.controllers.graph_controller import get_conditional_access_policies

logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address)
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
@limiter.limit("10/minute")
async def list_policies(
    request: Request,
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
        logger.error("Graph API error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to retrieve policies from Microsoft Graph.",
        ) from exc
    except Exception as exc:
        logger.exception("Unexpected error in /api/policies")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal error occurred. Please try again later.",
        ) from exc
