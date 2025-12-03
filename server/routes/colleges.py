from flask import Blueprint, request, jsonify
from services.auth import require_auth
from services.business import college_service

colleges_bp = Blueprint("colleges", __name__, url_prefix="/api/colleges")


# GET all colleges
@colleges_bp.route("/", methods=["GET"])
def get_colleges():
    try:
        colleges = college_service.get_all()
        return jsonify(colleges), 200
    except Exception as e:
        error_msg = f"Failed to fetch colleges: {str(e)}"
        print(f"Database GET colleges error: {e}")
        return jsonify({"error": error_msg}), 500


# POST create a new college
@colleges_bp.route("/", methods=["POST"])
@require_auth
def create_college():
    try:
        data = request.get_json()
        college = college_service.create(data["code"], data["name"])
        return jsonify(college), 201
    except Exception as e:
        error_msg = f"Failed to create college: {str(e)}"
        print(f"Database CREATE college error: {e}")
        return jsonify({"error": error_msg}), 500


# PUT update a college by code
@colleges_bp.route("/<string:code>", methods=["PUT"])
@require_auth
def update_college(code):
    try:
        data = request.get_json() or {}
        college = college_service.update(code, data.get("code"), data.get("name"))
        
        if not college:
            return jsonify({"error": "College not found"}), 404
        
        return jsonify(college), 200
    except Exception as e:
        error_msg = f"Failed to update college: {str(e)}"
        print(f"Database UPDATE college error: {e}")
        return jsonify({"error": error_msg}), 500


# DELETE a college by code
@colleges_bp.route("/<string:code>", methods=["DELETE"])
@require_auth
def delete_college(code):
    try:
        college = college_service.delete(code)
        
        if not college:
            return jsonify({"error": "College not found"}), 404
        
        return jsonify(college), 200
    except Exception as e:
        error_msg = f"Failed to delete college: {str(e)}"
        print(f"Database DELETE college error: {e}")
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
        
        deleted_count = college_service.bulk_delete(codes)
        return jsonify({"deleted": deleted_count}), 200
    except Exception as e:
        error_msg = f"Failed to bulk delete colleges: {str(e)}"
        print(f"Database BULK DELETE colleges error: {e}")
        return jsonify({"error": error_msg}), 500
