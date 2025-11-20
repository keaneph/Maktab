from flask import Blueprint, jsonify
from services.supabase_client import supabase
from services.auth import require_auth

users_bp = Blueprint("users", __name__, url_prefix="/api/users")


def format_user_row(row):
    return {
        "email": row["email"],
    }

# TODO: change table to auth
# TODO: change section cards as a global layout(?)
# GET all users
@users_bp.route("/", methods=["GET"])
def list_users():
    result = supabase.table("users").select("email").execute()
    rows = result.data or []
    return jsonify([format_user_row(r) for r in rows]), 200

# DELETE a user by email
@users_bp.route("/<string:email>", methods=["DELETE"])
@require_auth
def delete_user(email: str):
    result = (
        supabase.table("users")
        .delete()
        .eq(email)
        .select("email")
        .execute()
    )

    deleted = result.data[0] if result.data else None

    if not deleted:
        return jsonify({"error": "User not found"}), 404

    return jsonify(format_user_row(deleted)), 200

