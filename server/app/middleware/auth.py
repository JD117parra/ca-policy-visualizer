"""
Bearer token validation middleware.

In this skeleton the middleware confirms the Authorization header is present
and well-formed. In production, add JWT signature validation against the
Microsoft Entra ID JWKS endpoint to fully verify the token:
  https://login.microsoftonline.com/{tenant_id}/discovery/v2.0/keys
"""
from fastapi import Request, HTTPException, status


async def require_bearer_token(request: Request) -> str:
    """
    FastAPI dependency that extracts and validates the Bearer token from the
    Authorization header. Raises HTTP 401 if absent or malformed.

    Returns the raw token string for downstream use if needed.
    """
    auth_header = request.headers.get("Authorization", "")

    if not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = auth_header.split(" ", 1)[1].strip()

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Bearer token is empty.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # TODO (production): validate the JWT signature and verify aud, iss, exp, nbf claims.

    return token
