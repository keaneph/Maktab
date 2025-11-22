from flask import Blueprint, request, jsonify
from services.supabase_client import supabase
from services.auth import require_auth

colleges_bp = Blueprint("colleges", __name__, url_prefix="/api/colleges")

def format_college_row(row):
    return {
        "code": row["code"],
        "name": row["name"],
    }

# GET all colleges
@colleges_bp.route("/", methods=["GET"])
def get_colleges():
    try:
        result = supabase.table("colleges").select("code,name").execute()
        rows = result.data or []
        return jsonify([format_college_row(r) for r in rows]), 200
    except Exception as e:
        error_msg = f"Failed to fetch colleges: {str(e)}"
        print(f"Supabase GET colleges error: {e}")
        return jsonify({"error": error_msg}), 500


# POST create a new college
@colleges_bp.route("/", methods=["POST"])
@require_auth
def create_college():
    try:
        data = request.get_json()

        payload = {
            "code": data["code"],
            "name": data["name"],
        }

        result = supabase.table("colleges").insert(payload).execute()
        new_row = result.data[0] if result.data else None

        return jsonify(format_college_row(new_row)), 201
    except Exception as e:
        error_msg = f"Failed to create college: {str(e)}"
        print(f"Supabase CREATE college error: {e}")
        return jsonify({"error": error_msg}), 500


# PUT update a college by code
@colleges_bp.route("/<string:code>", methods=["PUT"])
@require_auth
def update_college(code):
    try:
        data = request.get_json() or {}

        payload = {
            "code": data.get("code"),
            "name": data.get("name"),
        }

        result = (
            supabase.table("colleges")
            .update(payload)
            .eq("code", code)
            .execute()
        )

        updated = result.data[0] if result.data else None
        return jsonify(format_college_row(updated)), 200
    except Exception as e:
        error_msg = f"Failed to update college: {str(e)}"
        print(f"Supabase UPDATE college error: {e}")
        return jsonify({"error": error_msg}), 500


# DELETE a college by code
@colleges_bp.route("/<string:code>", methods=["DELETE"])
@require_auth
def delete_college(code):
    try:
        result = (
            supabase.table("colleges")
            .delete()
            .eq("code", code)
            .execute()
        )

        deleted = result.data[0] if result.data else None
        return jsonify(format_college_row(deleted)), 200
    except Exception as e:
        error_msg = f"Failed to delete college: {str(e)}"
        print(f"Supabase DELETE college error: {e}")
        return jsonify({"error": error_msg}), 500


# BATCH DELETE colleges
@colleges_bp.route("/bulk-delete", methods=["POST"])
@require_auth
def bulk_delete_colleges():
    try:
        data = request.get_json()
        codes = data.get("codes", [])
        
        if not codes:
            return jsonify({"error": "No codes provided"}), 400
        
        result = (
            supabase.table("colleges")
            .delete()
            .in_("code", codes)
            .execute()
        )
        
        return jsonify({"deleted": len(result.data) if result.data else 0}), 200
    except Exception as e:
        error_msg = f"Failed to bulk delete colleges: {str(e)}"
        print(f"Supabase BULK DELETE colleges error: {e}")
        return jsonify({"error": error_msg}), 500
