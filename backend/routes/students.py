from flask import Blueprint, request, jsonify
from datetime import date, datetime
from db import get_conn, put_conn

students_bp = Blueprint("students", __name__, url_prefix="/api/students")

def format_students_row(row):
    return {
        "idNo": row[0],
        "firstName": row[1],
        "lastName": row[2],
        "course": row[3],
        "year": row[4],
        "gender": row[5],
        "dateCreated": row[6].isoformat() if isinstance(row[6], (date, datetime)) else row[6],
        "addedBy": row[7]
    }

# GET all students
@students_bp.route("/", methods=["GET"])
def get_students():
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM students;")
        rows = cur.fetchall()
        cur.close()
    finally:
        put_conn(conn)

    students = [format_students_row(row) for row in rows]
    return jsonify(students), 200

# POST create a new student
@students_bp.route("/", methods=["POST"])
def create_student():
    data = request.get_json()
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO students (idNo, firstName, lastName, course, year, gender, dateCreated, addedBy) VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING *;",
            (data["idNo"], data["firstName"], data["lastName"], data["course"], data["year"], data["gender"], data["dateCreated"], data["addedBy"]),
        )
        new_student = cur.fetchone()
        conn.commit()
        cur.close()
    except Exception:
        conn.rollback()
        raise
    finally:
        put_conn(conn)

    return jsonify(format_students_row(new_student)), 201

# PUT update a student by id_no
@students_bp.route("/<string:id_no>", methods=["PUT"])
def update_student(id_no):
    data = request.get_json()
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            "UPDATE students SET idNo = %s, firstName = %s, lastName = %s, course = %s, year = %s, gender = %s, dateCreated = %s, addedBy = %s WHERE idNo = %s RETURNING *;",
            (data["idNo"], data["firstName"], data["lastName"], data["course"], data["year"], data["gender"], data["dateCreated"], data["addedBy"], id_no),
        )
        updated = cur.fetchone()
        conn.commit()
        cur.close()
    except Exception:
        conn.rollback()
        raise
    finally:
        put_conn(conn)

    return jsonify(format_students_row(updated)), 200

# DELETE a student by id_no
@students_bp.route("/<string:id_no>", methods=["DELETE"])
def delete_student(id_no):
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM students WHERE idNo = %s RETURNING *;", (id_no,))
        deleted = cur.fetchone()
        conn.commit()
        cur.close()
    except Exception:
        conn.rollback()
        raise
    finally:
        put_conn(conn)

    return jsonify(format_students_row(deleted)), 200
