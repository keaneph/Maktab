from services.database import get_db_cursor


def get_all():
    """Get all users ordered by email."""
    with get_db_cursor() as cur:
        cur.execute('SELECT email FROM users ORDER BY email')
        return cur.fetchall()


def get_by_email(email):
    """Get a single user by email."""
    with get_db_cursor() as cur:
        cur.execute('SELECT email FROM users WHERE email = %s', (email,))
        return cur.fetchone()
