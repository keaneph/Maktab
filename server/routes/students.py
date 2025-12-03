from flask import Blueprint, request, jsonify
from services.auth import require_auth
from services.business import student_service

students_bp = Blueprint("students", __name__, url_prefix="/api/students")


# GET all students
@students_bp.route("/", methods=["GET"])
def get_students():
    try:
        students = student_service.get_all()
        return jsonify(students), 200
    except Exception as e:
        error_msg = f"Failed to fetch students: {str(e)}"
        print(f"Database GET students error: {e}")
        return jsonify({"error": error_msg}), 500


# POST create a new student
@students_bp.route("/", methods=["POST"])
@require_auth
def create_student():
    try:
        data = request.get_json()
        student = student_service.create(
            data["idNo"],
            data["firstName"],
            data["lastName"],
            data.get("course"),
            data.get("year"),
            data.get("gender"),
            data.get("photo_path")
        )
        return jsonify(student), 201
    except Exception as e:
        error_msg = f"Failed to create student: {str(e)}"
        print(f"Database CREATE student error: {e}")
        return jsonify({"error": error_msg}), 500


# PUT update a student by idNo
@students_bp.route("/<string:id_no>", methods=["PUT"])
@require_auth
def update_student(id_no):
    try:
        data = request.get_json()
        student = student_service.update(
            id_no,
            data["idNo"],
            data["firstName"],
            data["lastName"],
            data.get("course"),
            data.get("year"),
            data.get("gender"),
            data.get("photo_path")
        )
        
        if not student:
            return jsonify({"error": "Student not found"}), 404
        
        return jsonify(student), 200
    except Exception as e:
        error_msg = f"Failed to update student: {str(e)}"
        print(f"Database UPDATE student error: {e}")
        return jsonify({"error": error_msg}), 500


# DELETE a student by idNo
@students_bp.route("/<string:id_no>", methods=["DELETE"])
@require_auth
def delete_student(id_no):
    try:
        student = student_service.delete(id_no)
        
        if not student:
            return jsonify({"error": "Student not found"}), 404
        
        return jsonify(student), 200
    except Exception as e:
        error_msg = f"Failed to delete student: {str(e)}"
        print(f"Database DELETE student error: {e}")
        return jsonify({"error": error_msg}), 500


# BATCH DELETE students
@students_bp.route("/bulk-delete", methods=["POST"])
@require_auth
def bulk_delete_students():
    try:
        data = request.get_json()
        ids = data.get("ids", [])
        
        if not ids:
            return jsonify({"error": "No IDs provided"}), 400
        
        deleted_count = student_service.bulk_delete(ids)
        return jsonify({"deleted": deleted_count}), 200
    except Exception as e:
        error_msg = f"Failed to bulk delete students: {str(e)}"
        print(f"Database BULK DELETE students error: {e}")
        return jsonify({"error": error_msg}), 500
