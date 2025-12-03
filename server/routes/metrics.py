from flask import Blueprint, jsonify
from services.business import metrics_service

metrics_bp = Blueprint("metrics", __name__, url_prefix="/api/metrics")


@metrics_bp.route("/counts", methods=["GET"])
def get_counts():
    """Return total counts for all tables - lightweight endpoint."""
    try:
        counts = metrics_service.get_all_counts()
        return jsonify(counts), 200
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
    try:
        metrics = metrics_service.get_daily_metrics(days=7)
        return jsonify(metrics), 200
    except Exception as e:
        print("Database daily metrics error:", e)
        return jsonify([]), 200
