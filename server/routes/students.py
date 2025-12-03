from flask import Blueprint, request, jsonify
from services.database import get_db_cursor
from services.auth import require_auth

students_bp = Blueprint("students", __name__, url_prefix="/api/students")


def format_student_row(row):
    """Format a student row from the database."""
    return {
        "idNo": row["idNo"],
        "firstName": row["firstName"],
        "lastName": row["lastName"],
        "course": row.get("course"),
        "year": row.get("year"),
        "gender": row.get("gender"),
        "photo_path": row.get("photo_path"),
    }


# GET all students
@students_bp.route("/", methods=["GET"])
def get_students():
    try:
        with get_db_cursor() as cur:
            cur.execute('''
                SELECT "idNo", "firstName", "lastName", course, year, gender, photo_path 
                FROM students 
                ORDER BY "idNo"
            ''')
            rows = cur.fetchall()
        return jsonify([format_student_row(r) for r in rows]), 200
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
        
        with get_db_cursor() as cur:
            cur.execute('''
                INSERT INTO students ("idNo", "firstName", "lastName", course, year, gender, photo_path) 
                VALUES (%s, %s, %s, %s, %s, %s, %s) 
                RETURNING "idNo", "firstName", "lastName", course, year, gender, photo_path
            ''', (
                data["idNo"],
                data["firstName"],
                data["lastName"],
                data.get("course"),
                data.get("year"),
                data.get("gender"),
                data.get("photo_path")
            ))
            new_student = cur.fetchone()
        
        return jsonify(format_student_row(new_student)), 201
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
        
        with get_db_cursor() as cur:
            cur.execute('''
                UPDATE students 
                SET "idNo" = %s, "firstName" = %s, "lastName" = %s, course = %s, year = %s, gender = %s, photo_path = %s 
                WHERE "idNo" = %s 
                RETURNING "idNo", "firstName", "lastName", course, year, gender, photo_path
            ''', (
                data["idNo"],
                data["firstName"],
                data["lastName"],
                data.get("course"),
                data.get("year"),
                data.get("gender"),
                data.get("photo_path"),
                id_no
            ))
            updated_student = cur.fetchone()
        
        if not updated_student:
            return jsonify({"error": "Student not found"}), 404
        
        return jsonify(format_student_row(updated_student)), 200
    except Exception as e:
        error_msg = f"Failed to update student: {str(e)}"
        print(f"Database UPDATE student error: {e}")
        return jsonify({"error": error_msg}), 500


# DELETE a student by idNo
@students_bp.route("/<string:id_no>", methods=["DELETE"])
@require_auth
def delete_student(id_no):
    try:
        with get_db_cursor() as cur:
            cur.execute('''
                DELETE FROM students WHERE "idNo" = %s 
                RETURNING "idNo", "firstName", "lastName", course, year, gender, photo_path
            ''', (id_no,))
            deleted_student = cur.fetchone()
        
        if not deleted_student:
            return jsonify({"error": "Student not found"}), 404
        
        return jsonify(format_student_row(deleted_student)), 200
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
        
        with get_db_cursor() as cur:
            cur.execute(
                'DELETE FROM students WHERE "idNo" = ANY(%s) RETURNING "idNo"',
                (ids,)
            )
            deleted_rows = cur.fetchall()
        
        return jsonify({"deleted": len(deleted_rows)}), 200
    except Exception as e:
        error_msg = f"Failed to bulk delete students: {str(e)}"
        print(f"Database BULK DELETE students error: {e}")
        return jsonify({"error": error_msg}), 500
