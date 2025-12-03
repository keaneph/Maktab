from flask import Blueprint, request, jsonify
from services.auth import require_auth
from services.business import program_service

programs_bp = Blueprint("programs", __name__, url_prefix="/api/programs")


# GET all programs
@programs_bp.route("/", methods=["GET"])
def get_programs():
    try:
        programs = program_service.get_all()
        return jsonify(programs), 200
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
        program = program_service.create(data["code"], data["name"], data["college_code"])
        return jsonify(program), 201
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
        program = program_service.update(
            code, data["code"], data["name"], data["college_code"]
        )
        
        if not program:
            return jsonify({"error": "Program not found"}), 404
        
        return jsonify(program), 200
    except Exception as e:
        error_msg = f"Failed to update program: {str(e)}"
        print(f"Database UPDATE program error: {e}")
        return jsonify({"error": error_msg}), 500


# DELETE a program by code
@programs_bp.route("/<string:code>", methods=["DELETE"])
@require_auth
def delete_program(code):
    try:
        program = program_service.delete(code)
        
        if not program:
            return jsonify({"error": "Program not found"}), 404
        
        return jsonify(program), 200
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
        
        deleted_count = program_service.bulk_delete(codes)
        return jsonify({"deleted": deleted_count}), 200
    except Exception as e:
        error_msg = f"Failed to bulk delete programs: {str(e)}"
        print(f"Database BULK DELETE programs error: {e}")
        return jsonify({"error": error_msg}), 500
