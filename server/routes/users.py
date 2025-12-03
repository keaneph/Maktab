from flask import Blueprint, jsonify
from services.database import get_db_cursor

users_bp = Blueprint("users", __name__, url_prefix="/api/users")


def format_user_row(row):
    """Format a user row from the database."""
    return {
        "email": row["email"],
    }


# GET all users
@users_bp.route("/", methods=["GET"])
def list_users():
    try:
        with get_db_cursor() as cur:
            cur.execute('SELECT email FROM users ORDER BY email')
            rows = cur.fetchall()
        return jsonify([format_user_row(r) for r in rows]), 200
    except Exception as e:
        error_msg = f"Failed to fetch users: {str(e)}"
        print(f"Database GET users error: {e}")
        return jsonify({"error": error_msg}), 500

