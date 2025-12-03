from flask import Blueprint, request, jsonify
from services.database import get_db_cursor
from services.auth import require_auth

programs_bp = Blueprint("programs", __name__, url_prefix="/api/programs")


def format_program_row(row):
    """Format a program row from the database."""
    return {
        "code": row["code"],
        "name": row["name"],
        "college_code": row["college_code"],
    }


# GET all programs
@programs_bp.route("/", methods=["GET"])
def get_programs():
    try:
        with get_db_cursor() as cur:
            cur.execute('SELECT code, name, college_code FROM programs ORDER BY code')
            rows = cur.fetchall()
        return jsonify([format_program_row(r) for r in rows]), 200
    except Exception as e:
        error_msg = f"Failed to fetch programs: {str(e)}"
        print(f"Database GET programs error: {e}")
        return jsonify({"error": error_msg}), 500


# POST create a new program
@programs_bp.route("/", methods=["POST"])
@require_auth
def create_program():
    try:
        data = request.get_json()
        
        with get_db_cursor() as cur:
            cur.execute(
                'INSERT INTO programs (code, name, college_code) VALUES (%s, %s, %s) RETURNING code, name, college_code',
                (data["code"], data["name"], data["college_code"])
            )
            new_program = cur.fetchone()
        
        return jsonify(format_program_row(new_program)), 201
    except Exception as e:
        error_msg = f"Failed to create program: {str(e)}"
        print(f"Database CREATE program error: {e}")
        return jsonify({"error": error_msg}), 500


# PUT update a program by code
@programs_bp.route("/<string:code>", methods=["PUT"])
@require_auth
def update_program(code):
    try:
        data = request.get_json()
        
        with get_db_cursor() as cur:
            cur.execute(
                'UPDATE programs SET code = %s, name = %s, college_code = %s WHERE code = %s RETURNING code, name, college_code',
                (data["code"], data["name"], data["college_code"], code)
            )
            updated_program = cur.fetchone()
        
        if not updated_program:
            return jsonify({"error": "Program not found"}), 404
        
        return jsonify(format_program_row(updated_program)), 200
    except Exception as e:
        error_msg = f"Failed to update program: {str(e)}"
        print(f"Database UPDATE program error: {e}")
        return jsonify({"error": error_msg}), 500


# DELETE a program by code
@programs_bp.route("/<string:code>", methods=["DELETE"])
@require_auth
def delete_program(code):
    try:
        with get_db_cursor() as cur:
            cur.execute(
                'DELETE FROM programs WHERE code = %s RETURNING code, name, college_code',
                (code,)
            )
            deleted_program = cur.fetchone()
        
        if not deleted_program:
            return jsonify({"error": "Program not found"}), 404
        
        return jsonify(format_program_row(deleted_program)), 200
    except Exception as e:
        error_msg = f"Failed to delete program: {str(e)}"
        print(f"Database DELETE program error: {e}")
        return jsonify({"error": error_msg}), 500


# BATCH DELETE programs
@programs_bp.route("/bulk-delete", methods=["POST"])
@require_auth
def bulk_delete_programs():
    try:
        data = request.get_json()
        codes = data.get("codes", [])
        
        if not codes:
            return jsonify({"error": "No codes provided"}), 400
        
        with get_db_cursor() as cur:
            cur.execute(
                'DELETE FROM programs WHERE code = ANY(%s) RETURNING code',
                (codes,)
            )
            deleted_rows = cur.fetchall()
        
        return jsonify({"deleted": len(deleted_rows)}), 200
    except Exception as e:
        error_msg = f"Failed to bulk delete programs: {str(e)}"
        print(f"Database BULK DELETE programs error: {e}")
        return jsonify({"error": error_msg}), 500
