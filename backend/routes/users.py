from flask import Blueprint, jsonify
from db import get_conn, put_conn
from auth import require_auth
from datetime import date, datetime

users_bp = Blueprint("users", __name__, url_prefix="/api/users")


def format_user_row(row):
    return {
        "username": row[0],
        "email": row[1],
        "dateLogged": row[2].isoformat() if isinstance(row[2], (date, datetime)) else row[2],
    }


@users_bp.route("/", methods=["GET"])
def list_users():
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute("SELECT username, email, date_logged FROM users;")
        rows = cur.fetchall()
        cur.close()
    finally:
        put_conn(conn)

    return jsonify([format_user_row(r) for r in rows]), 200

@users_bp.route("/<string:username>", methods=["DELETE"])
@require_auth()
def delete_user(username: str):
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM users WHERE username = %s RETURNING username, email, date_logged;", (username,))
        deleted = cur.fetchone()
        conn.commit()
        cur.close()
    except Exception:
        conn.rollback()
        raise
    finally:
        put_conn(conn)

    if not deleted:
        return jsonify({"error": "User not found"}), 404

    return jsonify(format_user_row(deleted)), 200


