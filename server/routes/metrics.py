from flask import Blueprint, jsonify
from datetime import date, timedelta
from server.services.supabase_client import supabase

metrics_bp = Blueprint("metrics", __name__, url_prefix="/api/metrics")

@metrics_bp.route("/daily", methods=["GET"])
def daily_metrics():
    """Return last 7 days of counts for colleges, programs, students, users."""

    today = date.today()
    start = today - timedelta(days=6)

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
                .lte("created_at", today.isoformat())
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
