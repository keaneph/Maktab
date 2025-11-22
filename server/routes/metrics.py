from flask import Blueprint, jsonify
from datetime import date, timedelta
from services.supabase_client import supabase

metrics_bp = Blueprint("metrics", __name__, url_prefix="/api/metrics")

@metrics_bp.route("/counts", methods=["GET"])
def get_counts():
    """Return total counts for all tables - lightweight endpoint."""
    try:
        # Use count parameter for efficient counting without fetching rows
        college_result = supabase.table("colleges").select("*", count="exact").execute()
        program_result = supabase.table("programs").select("*", count="exact").execute()
        student_result = supabase.table("students").select("*", count="exact").execute()
        user_result = supabase.table("users").select("*", count="exact").execute()
        
        return jsonify({
            "colleges": college_result.count if college_result.count is not None else 0,
            "programs": program_result.count if program_result.count is not None else 0,
            "students": student_result.count if student_result.count is not None else 0,
            "users": user_result.count if user_result.count is not None else 0,
        }), 200
    except Exception as e:
        print("Supabase GET counts error:", e)
        # Return zeros on error so UI doesn't break
        return jsonify({
            "colleges": 0,
            "programs": 0,
            "students": 0,
            "users": 0,
        }), 200

@metrics_bp.route("/daily", methods=["GET"])
def daily_metrics():
    """Return last 7 days of counts for colleges, programs, students, users."""

    today = date.today()
    start = today - timedelta(days=6)
    # Include the entire day by adding one day and using lt instead of lte
    end = today + timedelta(days=1)

    # Build buckets
    days = [(start + timedelta(days=i)).isoformat() for i in range(7)]
    result_map = {d: {"date": d, "college": 0, "program": 0, "students": 0, "users": 0} for d in days}

    def get_daily_counts(table_name):
        """Return a dict of counts per day for the given table."""
        try:
            resp = (
                supabase.table(table_name)
                .select("created_at")
                .gte("created_at", start.isoformat())
                .lt("created_at", end.isoformat())
                .execute()
            )
            rows = resp.data or []

            counts = {}
            for row in rows:
                d_str = row["created_at"][:10]
                counts[d_str] = counts.get(d_str, 0) + 1
            return counts

        except Exception:
            return {}

    college_counts = get_daily_counts("colleges")
    program_counts = get_daily_counts("programs")
    student_counts = get_daily_counts("students")
    user_counts = get_daily_counts("users")

    for d in result_map:
        result_map[d]["college"] = college_counts.get(d, 0)
        result_map[d]["program"] = program_counts.get(d, 0)
        result_map[d]["students"] = student_counts.get(d, 0)
        result_map[d]["users"] = user_counts.get(d, 0)

    return jsonify([result_map[d] for d in days]), 200
