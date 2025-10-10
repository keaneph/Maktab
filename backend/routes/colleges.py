from flask import Blueprint, request, jsonify
from datetime import date, datetime
from db import get_conn, put_conn

colleges_bp = Blueprint("colleges", __name__, url_prefix="/api/colleges")

def format_college_row(row):
    return {
        "code": row[0],
        "name": row[1],
        "dateCreated": row[2].isoformat() if isinstance(row[2], (date, datetime)) else row[2],
        "addedBy": row[3]
    }

# GET all colleges
@colleges_bp.route("/", methods=["GET"])
def get_colleges():
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM colleges;")
        rows = cur.fetchall()
        cur.close()
    finally:
        put_conn(conn)

    colleges = [format_college_row(row) for row in rows]
    return jsonify(colleges), 200

# POST create a new college
@colleges_bp.route("/", methods=["POST"])
def create_college():
    data = request.get_json()
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO colleges (code, name, dateCreated, addedBy) VALUES (%s, %s, %s, %s) RETURNING *;",
            (data["code"], data["name"], data["dateCreated"], data["addedBy"]),
        )
        new_college = cur.fetchone()
        conn.commit()
        cur.close()
    except Exception:
        conn.rollback()
        raise
    finally:
        put_conn(conn)

    return jsonify(format_college_row(new_college)), 201

# PUT update a college by code
@colleges_bp.route("/<string:code>", methods=["PUT"])
def update_college(code):
    data = request.get_json()
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            "UPDATE colleges SET code = %s, name = %s, dateCreated = %s, addedBy = %s WHERE code = %s RETURNING *;",
            (data["code"], data["name"], data["dateCreated"], data["addedBy"], code),
        )
        updated = cur.fetchone()
        conn.commit()
        cur.close()
    except Exception:
        conn.rollback()
        raise
    finally:
        put_conn(conn)

    return jsonify(format_college_row(updated)), 200

# DELETE a college by code
@colleges_bp.route("/<string:code>", methods=["DELETE"])
def delete_college(code):
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM colleges WHERE code = %s RETURNING *;", (code,))
        deleted = cur.fetchone()
        conn.commit()
        cur.close()
    except Exception:
        conn.rollback()
        raise
    finally:
        put_conn(conn)

    return jsonify(format_college_row(deleted)), 200
