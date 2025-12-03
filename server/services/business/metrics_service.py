from datetime import date, timedelta
from repositories import metrics_repository


def get_all_counts():
    """Get total counts for all tables."""
    return {
        "colleges": metrics_repository.get_table_count("colleges"),
        "programs": metrics_repository.get_table_count("programs"),
        "students": metrics_repository.get_table_count("students"),
        "users": metrics_repository.get_table_count("users"),
    }


def get_daily_metrics(days=7):
    """Get daily metrics for the last N days."""
    today = date.today()
    start = today - timedelta(days=days - 1)
    end = today + timedelta(days=1)  # Include entire day
    
    # Build date buckets
    date_list = [(start + timedelta(days=i)).isoformat() for i in range(days)]
    result_map = {
        d: {"date": d, "college": 0, "program": 0, "students": 0, "users": 0}
        for d in date_list
    }
    
    # Get counts for each table
    tables = {
        "colleges": "college",
        "programs": "program",
        "students": "students",
        "users": "users",
    }
    
    for table_name, result_key in tables.items():
        rows = metrics_repository.get_daily_counts(
            table_name, start.isoformat(), end.isoformat()
        )
        for row in rows:
            day_str = row['day'].isoformat() if hasattr(row['day'], 'isoformat') else str(row['day'])
            if day_str in result_map:
                result_map[day_str][result_key] = row['count']
    
    return [result_map[d] for d in date_list]
