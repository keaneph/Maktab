from flask import Blueprint, request, jsonify
from datetime import date, datetime
from db import get_conn, put_conn

programs_bp = Blueprint("programs", __name__, url_prefix="/api/programs")

def format_programs_row(row):
    return {
        "code": row[0],
        "name": row[1],
        "college_code": row[2],
        "dateCreated": row[3].isoformat() if isinstance(row[3], (date, datetime)) else row[3],
        "addedBy": row[4]
    }

# GET all programs
@programs_bp.route("/", methods=["GET"])
def get_programs():
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM programs;")
        rows = cur.fetchall()
        cur.close()
    finally:
        put_conn(conn)

    programs = [format_programs_row(row) for row in rows]
    return jsonify(programs), 200
    
# POST create a new program
@programs_bp.route("/", methods=["POST"])
def create_program():
    data = request.get_json()
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO programs (code, name, college_code, dateCreated, addedBy) VALUES (%s, %s, %s, %s, %s) RETURNING *;",
            (data["code"], data["name"], data["college_code"], data["dateCreated"], data["addedBy"]),
        )
        new_program = cur.fetchone()
        conn.commit()
        cur.close()
    except Exception:
        conn.rollback()
        raise
    finally:
        put_conn(conn)

    return jsonify(format_programs_row(new_program)), 201

# PUT update a programs by code
@programs_bp.route("/<string:code>", methods=["PUT"])
def update_program(code):
    data = request.get_json()
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            "UPDATE programs SET code = %s, name = %s, college_code = %s, dateCreated = %s, addedBy = %s WHERE code = %s RETURNING *;",
            (data["code"], data["name"], data["college_code"], data["dateCreated"], data["addedBy"], code),
        )
        updated = cur.fetchone()
        conn.commit()
        cur.close()
    except Exception:
        conn.rollback()
        raise
    finally:
        put_conn(conn)

    return jsonify(format_programs_row(updated)), 200

# DELETE a program by code
@programs_bp.route("/<string:code>", methods=["DELETE"])
def delete_program(code):
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM programs WHERE code = %s RETURNING *;", (code,))
        deleted = cur.fetchone()
        conn.commit()
        cur.close()
    except Exception:
        conn.rollback()
        raise
    finally:
        put_conn(conn)

    return jsonify(format_programs_row(deleted)), 200
