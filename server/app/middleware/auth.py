"""
Bearer token validation middleware.

Validates JWT tokens against the Microsoft Entra ID JWKS endpoint,
verifying signature, expiration, audience, and issuer claims.
"""
import logging
from functools import lru_cache

import httpx
import jwt
from fastapi import Request, HTTPException, status

from app.settings import get_settings

logger = logging.getLogger(__name__)

JWKS_URL_TEMPLATE = (
    "https://login.microsoftonline.com/{tenant_id}/discovery/v2.0/keys"
)
ISSUER_TEMPLATE = "https://sts.windows.net/{tenant_id}/"


@lru_cache
def _get_jwks_client(tenant_id: str) -> jwt.PyJWKClient:
    """Build a cached JWKS client for the given tenant."""
    url = JWKS_URL_TEMPLATE.format(tenant_id=tenant_id)
    return jwt.PyJWKClient(url, cache_keys=True, lifespan=3600)


def _decode_and_validate(token: str) -> dict:
    """
    Decode the JWT, verify its signature against the JWKS endpoint,
    and validate standard claims (exp, nbf, aud, iss).

    Returns the decoded payload on success; raises on any failure.
    """
    settings = get_settings()
    jwks_client = _get_jwks_client(settings.tenant_id)

    signing_key = jwks_client.get_signing_key_from_jwt(token)

    expected_issuer = ISSUER_TEMPLATE.format(tenant_id=settings.tenant_id)

    payload = jwt.decode(
        token,
        signing_key.key,
        algorithms=["RS256"],
        audience=settings.client_id,
        issuer=expected_issuer,
        options={
            "require": ["exp", "nbf", "aud", "iss", "sub"],
            "verify_exp": True,
            "verify_nbf": True,
            "verify_aud": True,
            "verify_iss": True,
        },
    )
    return payload


async def require_bearer_token(request: Request) -> str:
    """
    FastAPI dependency that extracts and validates the Bearer token from the
    Authorization header.

    - Checks the Authorization header is present and well-formed.
    - Validates the JWT signature against the Microsoft Entra ID JWKS endpoint.
    - Verifies exp, nbf, aud, iss, and sub claims.

    Returns the raw token string for downstream use.
    """
    auth_header = request.headers.get("Authorization", "")

    client_ip = request.client.host if request.client else "unknown"

    if not auth_header.startswith("Bearer "):
        logger.warning("auth_failure: missing_header, ip=%s, path=%s", client_ip, request.url.path)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = auth_header.split(" ", 1)[1].strip()

    if not token:
        logger.warning("auth_failure: empty_token, ip=%s, path=%s", client_ip, request.url.path)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Bearer token is empty.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        _decode_and_validate(token)
    except jwt.ExpiredSignatureError:
        logger.warning("auth_failure: token_expired, ip=%s, path=%s", client_ip, request.url.path)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidAudienceError:
        logger.warning("auth_failure: invalid_audience, ip=%s, path=%s", client_ip, request.url.path)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token audience is invalid.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidIssuerError:
        logger.warning("auth_failure: invalid_issuer, ip=%s, path=%s", client_ip, request.url.path)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token issuer is invalid.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWKClientError:
        logger.exception("auth_failure: jwks_fetch_error, ip=%s, path=%s", client_ip, request.url.path)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to validate token at this time.",
        )
    except jwt.InvalidTokenError:
        logger.warning("auth_failure: invalid_token, ip=%s, path=%s", client_ip, request.url.path)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return token
