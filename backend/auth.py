import os
import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from flask import request, g, jsonify
from functools import wraps


def _get_secret() -> str:
    secret = os.getenv("SECRET_KEY")
    if not secret:
        raise RuntimeError("SECRET_KEY is not set")
    return secret


def hash_password(plain_text_password: str) -> str:
    password_bytes = plain_text_password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode("utf-8")


def verify_password(plain_text_password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(plain_text_password.encode("utf-8"), password_hash.encode("utf-8"))
    except Exception:
        return False


def generate_jwt(payload: Dict[str, Any], expires_in_days: int = 7) -> str:
    exp = datetime.now(timezone.utc) + timedelta(days=expires_in_days)
    to_encode = {
        **payload,
        "exp": exp,
        "iat": datetime.now(timezone.utc),
    }
    token = jwt.encode(to_encode, _get_secret(), algorithm="HS256")
    # PyJWT returns str for HS256
    return token


def verify_jwt(token: str) -> Optional[Dict[str, Any]]:
    try:
        decoded = jwt.decode(token, _get_secret(), algorithms=["HS256"])
        return decoded
    except Exception:
        return None


def require_auth():
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            token = request.cookies.get("access_token")
            if not token:
                return jsonify({"error": "Unauthorized"}), 401
            payload = verify_jwt(token)
            if not payload:
                return jsonify({"error": "Unauthorized"}), 401
            g.current_user = {"username": payload.get("username"), "email": payload.get("email")}
            return fn(*args, **kwargs)
        return wrapper
    return decorator


