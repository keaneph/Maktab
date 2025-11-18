from flask import Blueprint, request, jsonify
from services.supabase_client import supabase

programs_bp = Blueprint("programs", __name__, url_prefix="/api/programs")

def format_program_row(row):
    return {
        "code": row["code"],
        "name": row["name"],
        "college_code": row["college_code"],
    }

# GET all programs
@programs_bp.route("/", methods=["GET"])
def get_programs():
    try:
        result = supabase.table("programs").select("*").execute()
        rows = result.data or []
        return jsonify([format_program_row(r) for r in rows]), 200
    except Exception as e:
        print("Supabase GET programs error:", e)
        return jsonify({"error": "Failed to fetch programs"}), 500


# POST create a new program
@programs_bp.route("/", methods=["POST"])
def create_program():
    try:
        data = request.get_json()

        payload = {
            "code": data["code"],
            "name": data["name"],
            "college_code": data["college_code"],
        }

        result = supabase.table("programs").insert(payload).execute()
        new_program = result.data[0] if result.data else None

        return jsonify(format_program_row(new_program)), 201
    except Exception as e:
        print("Supabase CREATE program error:", e)
        return jsonify({"error": "Failed to create program"}), 500


# PUT update a program by code
@programs_bp.route("/<string:code>", methods=["PUT"])
def update_program(code):
    try:
        data = request.get_json()

        payload = {
            "code": data["code"],
            "name": data["name"],
            "college_code": data["college_code"],
        }

        result = (
            supabase.table("programs")
            .update(payload)
            .eq("code", code)
            .execute()
        )

        updated_program = result.data[0] if result.data else None
        return jsonify(format_program_row(updated_program)), 200
    except Exception as e:
        print("Supabase UPDATE program error:", e)
        return jsonify({"error": "Failed to update program"}), 500


# DELETE a program by code
@programs_bp.route("/<string:code>", methods=["DELETE"])
def delete_program(code):
    try:
        result = (
            supabase.table("programs")
            .delete()
            .eq("code", code)
            .execute()
        )

        deleted_program = result.data[0] if result.data else None
        return jsonify(format_program_row(deleted_program)), 200
    except Exception as e:
        print("Supabase DELETE program error:", e)
        return jsonify({"error": "Failed to delete program"}), 500
