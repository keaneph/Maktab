from flask import Blueprint, request, jsonify
from server.services.supabase_client import supabase

students_bp = Blueprint("students", __name__, url_prefix="/api/students")

def format_student_row(row):
    return {
        "idNo": row["idNo"],
        "firstName": row["firstName"],
        "lastName": row["lastName"],
        "course": row.get("course"),
        "year": row.get("year"),
        "gender": row.get("gender"),
    }

# GET all students
@students_bp.route("/", methods=["GET"])
def get_students():
    try:
        result = supabase.table("students").select("*").execute()
        rows = result.data or []
        return jsonify([format_student_row(r) for r in rows]), 200
    except Exception as e:
        print("Supabase GET students error:", e)
        return jsonify({"error": "Failed to fetch students"}), 500


# POST create a new student
@students_bp.route("/", methods=["POST"])
def create_student():
    try:
        data = request.get_json()

        payload = {
            "idNo": data["idNo"],
            "firstName": data["firstName"],
            "lastName": data["lastName"],
            "course": data.get("course"),
            "year": data.get("year"),
            "gender": data.get("gender"),
        }

        result = supabase.table("students").insert(payload).execute()
        new_student = result.data[0] if result.data else None

        return jsonify(format_student_row(new_student)), 201
    except Exception as e:
        print("Supabase CREATE student error:", e)
        return jsonify({"error": "Failed to create student"}), 500


# PUT update a student by idNo
@students_bp.route("/<string:id_no>", methods=["PUT"])
def update_student(id_no):
    try:
        data = request.get_json()

        payload = {
            "idNo": data["idNo"],
            "firstName": data["firstName"],
            "lastName": data["lastName"],
            "course": data.get("course"),
            "year": data.get("year"),
            "gender": data.get("gender"),
        }

        result = (
            supabase.table("students")
            .update(payload)
            .eq("idNo", id_no)
            .execute()
        )

        updated_student = result.data[0] if result.data else None
        return jsonify(format_student_row(updated_student)), 200
    except Exception as e:
        print("Supabase UPDATE student error:", e)
        return jsonify({"error": "Failed to update student"}), 500


# DELETE a student by idNo
@students_bp.route("/<string:id_no>", methods=["DELETE"])
def delete_student(id_no):
    try:
        result = (
            supabase.table("students")
            .delete()
            .eq("idNo", id_no)
            .execute()
        )

        deleted_student = result.data[0] if result.data else None
        return jsonify(format_student_row(deleted_student)), 200
    except Exception as e:
        print("Supabase DELETE student error:", e)
        return jsonify({"error": "Failed to delete student"}), 500
