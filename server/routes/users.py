from flask import Blueprint, jsonify
from server.services.supabase_client import supabase

users_bp = Blueprint("users", __name__, url_prefix="/api/users")


def format_user_row(row):
    return {
        "username": row["username"],
        "email": row["email"],
        "dateLogged": row.get("date_logged"),
    }

# GET all users
@users_bp.route("/", methods=["GET"])
def list_users():
    result = supabase.table("users").select("username, email, date_logged").execute()
    rows = result.data or []
    return jsonify([format_user_row(r) for r in rows]), 200

# DELETE a user by username
@users_bp.route("/<string:username>", methods=["DELETE"])
def delete_user(username: str):
    result = (
        supabase.table("users")
        .delete()
        .eq("username", username)
        .select("username, email, date_logged")
        .execute()
    )

    deleted = result.data[0] if result.data else None

    if not deleted:
        return jsonify({"error": "User not found"}), 404

    return jsonify(format_user_row(deleted)), 200

