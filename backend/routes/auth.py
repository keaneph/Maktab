from flask import Blueprint, request, jsonify, make_response, g
from datetime import datetime, timezone
from db import get_conn, put_conn
from auth import hash_password, verify_password, generate_jwt, verify_jwt


auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


def _set_auth_cookie(resp, token: str):
    # in dev, Secure=False (http). For production behind https, set secure=True.
    resp.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="Lax",
        max_age=7 * 24 * 60 * 60,
        path="/",
        secure=False,
    )


@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json(force=True) or {}
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip()
    password = data.get("password") or ""

    if not username or not email or len(password) < 8:
        return jsonify({"error": "Invalid input"}), 400

    conn = get_conn()
    try:
        cur = conn.cursor()
        # check username separately
        cur.execute("SELECT 1 FROM users WHERE username = %s;", (username,))
        if cur.fetchone():
            return jsonify({"error": "Username already in use", "field": "username"}), 409
        # check email separately
        cur.execute("SELECT 1 FROM users WHERE email = %s;", (email,))
        if cur.fetchone():
            return jsonify({"error": "Email already in use", "field": "email"}), 409

        pwd_hash = hash_password(password)
        cur.execute(
            "INSERT INTO users (username, email, password_hash, date_logged) VALUES (%s, %s, %s, %s) RETURNING username, email, date_logged;",
            (username, email, pwd_hash, None),
        )
        user_row = cur.fetchone()
        conn.commit()
        cur.close()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        put_conn(conn)

    token = generate_jwt({"username": user_row[0], "email": user_row[1]})
    resp = make_response(jsonify({
        "username": user_row[0],
        "email": user_row[1],
        "dateLogged": user_row[2],
    }))
    _set_auth_cookie(resp, token)
    return resp, 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(force=True) or {}
    username_or_email = (data.get("usernameOrEmail") or "").strip()
    password = data.get("password") or ""

    if not username_or_email or not password:
        return jsonify({"error": "Invalid input"}), 400

    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT username, email, password_hash, date_logged FROM users WHERE username = %s OR email = %s;",
            (username_or_email, username_or_email),
        )
        row = cur.fetchone()
        if not row or not verify_password(password, row[2]):
            return jsonify({"error": "Invalid credentials"}), 401

        now_iso = datetime.now(timezone.utc).isoformat()
        cur.execute("UPDATE users SET date_logged = %s WHERE username = %s RETURNING username, email, date_logged;", (now_iso, row[0]))
        updated = cur.fetchone()
        conn.commit()
        cur.close()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        put_conn(conn)

    token = generate_jwt({"username": updated[0], "email": updated[1]})
    resp = make_response(jsonify({
        "username": updated[0],
        "email": updated[1],
        "dateLogged": updated[2],
    }))
    _set_auth_cookie(resp, token)
    return resp, 200


@auth_bp.route("/me", methods=["GET"])
def me():
    token = request.cookies.get("access_token")
    if not token:
        return jsonify({"error": "Unauthorized"}), 401
    payload = verify_jwt(token)
    if not payload:
        return jsonify({"error": "Unauthorized"}), 401

    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT username, email, date_logged FROM users WHERE username = %s;",
            (payload.get("username"),),
        )
        row = cur.fetchone()
        cur.close()
    finally:
        put_conn(conn)

    if not row:
        return jsonify({"error": "Unauthorized"}), 401

    return jsonify({"username": row[0], "email": row[1], "dateLogged": row[2]}), 200


@auth_bp.route("/logout", methods=["POST"])
def logout():
    resp = make_response(jsonify({"message": "Logged out"}))
    # clear cookie by matching attributes used when setting
    resp.set_cookie(
        key="access_token",
        value="",
        max_age=0,
        expires=0,
        path="/",
        httponly=True,
        samesite="Lax",
        secure=False,
    )
    return resp, 200


