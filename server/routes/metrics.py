from flask import Blueprint, jsonify
from datetime import date, timedelta
from services.database import get_db_cursor

metrics_bp = Blueprint("metrics", __name__, url_prefix="/api/metrics")


@metrics_bp.route("/counts", methods=["GET"])
def get_counts():
    """Return total counts for all tables - lightweight endpoint."""
    try:
        with get_db_cursor() as cur:
            cur.execute('SELECT COUNT(*) as count FROM colleges')
            college_count = cur.fetchone()['count']
            
            cur.execute('SELECT COUNT(*) as count FROM programs')
            program_count = cur.fetchone()['count']
            
            cur.execute('SELECT COUNT(*) as count FROM students')
            student_count = cur.fetchone()['count']
            
            cur.execute('SELECT COUNT(*) as count FROM users')
            user_count = cur.fetchone()['count']
        
        return jsonify({
            "colleges": college_count,
            "programs": program_count,
            "students": student_count,
            "users": user_count,
        }), 200
    except Exception as e:
        print("Database GET counts error:", e)
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
            with get_db_cursor() as cur:
                cur.execute(
                    f'SELECT DATE(created_at) as day, COUNT(*) as count FROM {table_name} '
                    'WHERE created_at >= %s AND created_at < %s '
                    'GROUP BY DATE(created_at)',
                    (start.isoformat(), end.isoformat())
                )
                rows = cur.fetchall()
            
            counts = {}
            for row in rows:
                # Convert date to string if needed
                day_str = row['day'].isoformat() if hasattr(row['day'], 'isoformat') else str(row['day'])
                counts[day_str] = row['count']
            return counts

        except Exception as e:
            print(f"Database daily counts error for {table_name}: {e}")
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
