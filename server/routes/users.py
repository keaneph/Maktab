from flask import Blueprint, jsonify
from services.business import user_service

users_bp = Blueprint("users", __name__, url_prefix="/api/users")


# GET all users
@users_bp.route("/", methods=["GET"])
def list_users():
    try:
        users = user_service.get_all()
        return jsonify(users), 200
    except Exception as e:
        error_msg = f"Failed to fetch users: {str(e)}"
        print(f"Database GET users error: {e}")
        return jsonify({"error": error_msg}), 500

