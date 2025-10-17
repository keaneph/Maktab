from flask import Blueprint, jsonify
from datetime import date, datetime, timedelta
from db import get_conn, put_conn

metrics_bp = Blueprint("metrics", __name__, url_prefix="/api/metrics")


def _iso(d: date | datetime) -> str:
    return d.isoformat() if isinstance(d, (date, datetime)) else str(d)


@metrics_bp.route("/daily", methods=["GET"])
def daily_metrics():
    """Return last 7 days of counts for colleges, programs, students.

    Response format:
    [
      { "date": "YYYY-MM-DD", "college": number, "program": number, "students": number },
      ... (7 entries, most recent last)
    ]
    """
    today = date.today()
    start = today - timedelta(days=6)

    # Build buckets for each day
    days = [(start + timedelta(days=i)) for i in range(7)]
    result_map = {d: {"date": d.isoformat(), "college": 0, "program": 0, "students": 0, "users": 0} for d in days}

    conn = get_conn()
    try:
        cur = conn.cursor()

        # Colleges per day
        cur.execute(
            """
            SELECT DATE(dateCreated) AS d, COUNT(*)
            FROM colleges
            WHERE DATE(dateCreated) BETWEEN %s AND %s
            GROUP BY d
            ORDER BY d
            """,
            (start, today),
        )
        for d, cnt in cur.fetchall():
            if isinstance(d, datetime):
                d = d.date()
            if d in result_map:
                result_map[d]["college"] = cnt

        # Programs per day
        cur.execute(
            """
            SELECT DATE(dateCreated) AS d, COUNT(*)
            FROM programs
            WHERE DATE(dateCreated) BETWEEN %s AND %s
            GROUP BY d
            ORDER BY d
            """,
            (start, today),
        )
        for d, cnt in cur.fetchall():
            if isinstance(d, datetime):
                d = d.date()
            if d in result_map:
                result_map[d]["program"] = cnt

        # Students per day
        cur.execute(
            """
            SELECT DATE(dateCreated) AS d, COUNT(*)
            FROM students
            WHERE DATE(dateCreated) BETWEEN %s AND %s
            GROUP BY d
            ORDER BY d
            """,
            (start, today),
        )
        for d, cnt in cur.fetchall():
            if isinstance(d, datetime):
                d = d.date()
            if d in result_map:
                result_map[d]["students"] = cnt

        # Users per day (site visits/users log)
        try:
            cur.execute(
                """
                SELECT DATE(date_logged) AS d, COUNT(*)
                FROM users
                WHERE DATE(date_logged) BETWEEN %s AND %s
                GROUP BY d
                ORDER BY d
                """,
                (start, today),
            )
            for d, cnt in cur.fetchall():
                if isinstance(d, datetime):
                    d = d.date()
                if d in result_map:
                    result_map[d]["users"] = cnt
        except Exception:
            # If users table or column not present, ignore and keep zeros
            pass

        cur.close()
    finally:
        put_conn(conn)

    # Return in chronological order
    data = [result_map[d] for d in days]
    return jsonify(data), 200


