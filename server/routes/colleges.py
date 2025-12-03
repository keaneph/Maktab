from flask import Blueprint, request, jsonify
from services.database import get_db_cursor
from services.auth import require_auth

colleges_bp = Blueprint("colleges", __name__, url_prefix="/api/colleges")


def format_college_row(row):
    """Format a college row from the database."""
    return {
        "code": row["code"],
        "name": row["name"],
    }


# GET all colleges
@colleges_bp.route("/", methods=["GET"])
def get_colleges():
    try:
        with get_db_cursor() as cur:
            cur.execute('SELECT code, name FROM colleges ORDER BY code')
            rows = cur.fetchall()
        return jsonify([format_college_row(r) for r in rows]), 200
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
        
        with get_db_cursor() as cur:
            cur.execute(
                'INSERT INTO colleges (code, name) VALUES (%s, %s) RETURNING code, name',
                (data["code"], data["name"])
            )
            new_row = cur.fetchone()
        
        return jsonify(format_college_row(new_row)), 201
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
        
        with get_db_cursor() as cur:
            cur.execute(
                'UPDATE colleges SET code = %s, name = %s WHERE code = %s RETURNING code, name',
                (data.get("code"), data.get("name"), code)
            )
            updated = cur.fetchone()
        
        if not updated:
            return jsonify({"error": "College not found"}), 404
        
        return jsonify(format_college_row(updated)), 200
    except Exception as e:
        error_msg = f"Failed to update college: {str(e)}"
        print(f"Database UPDATE college error: {e}")
        return jsonify({"error": error_msg}), 500


# DELETE a college by code
@colleges_bp.route("/<string:code>", methods=["DELETE"])
@require_auth
def delete_college(code):
    try:
        with get_db_cursor() as cur:
            cur.execute(
                'DELETE FROM colleges WHERE code = %s RETURNING code, name',
                (code,)
            )
            deleted = cur.fetchone()
        
        if not deleted:
            return jsonify({"error": "College not found"}), 404
        
        return jsonify(format_college_row(deleted)), 200
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
        
        with get_db_cursor() as cur:
            # Use ANY with array for IN clause
            cur.execute(
                'DELETE FROM colleges WHERE code = ANY(%s) RETURNING code',
                (codes,)
            )
            deleted_rows = cur.fetchall()
        
        return jsonify({"deleted": len(deleted_rows)}), 200
    except Exception as e:
        error_msg = f"Failed to bulk delete colleges: {str(e)}"
        print(f"Database BULK DELETE colleges error: {e}")
        return jsonify({"error": error_msg}), 500
