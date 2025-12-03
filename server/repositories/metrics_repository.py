from services.database import get_db_cursor


def get_table_count(table_name):
    """Get total count for a table."""
    with get_db_cursor() as cur:
        cur.execute(f'SELECT COUNT(*) as count FROM {table_name}')
        return cur.fetchone()['count']


def get_daily_counts(table_name, start_date, end_date):
    """Get daily counts for a table within a date range."""
    with get_db_cursor() as cur:
        cur.execute(
            f'SELECT DATE(created_at) as day, COUNT(*) as count FROM {table_name} '
            'WHERE created_at >= %s AND created_at < %s '
            'GROUP BY DATE(created_at)',
            (start_date, end_date)
        )
        return cur.fetchall()
