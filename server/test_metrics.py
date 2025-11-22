from services.supabase_client import supabase
from datetime import date, timedelta
import json

today = date.today()
start = today - timedelta(days=6)
end = today + timedelta(days=1)

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

    except Exception as e:
        print(f"Error: {e}")
        return {}

college_counts = get_daily_counts("colleges")

print("Days in range:", days)
print("\nCollege counts by day:", college_counts)

for d in result_map:
    result_map[d]["college"] = college_counts.get(d, 0)

print("\nFinal result:")
print(json.dumps([result_map[d] for d in days], indent=2))
