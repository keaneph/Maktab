from flask import Blueprint, jsonify
from services.supabase_client import supabase
from services.auth import require_auth

users_bp = Blueprint("users", __name__, url_prefix="/api/users")


def format_user_row(row):
    return {
        "email": row["email"],
    }

# GET all users
@users_bp.route("/", methods=["GET"])
def list_users():
    result = supabase.table("users").select("email").execute()
    rows = result.data or []
    return jsonify([format_user_row(r) for r in rows]), 200

