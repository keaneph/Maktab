from services.database import get_db_cursor


def get_all():
    """Get all colleges ordered by code."""
    with get_db_cursor() as cur:
        cur.execute('SELECT code, name FROM colleges ORDER BY code')
        return cur.fetchall()


def get_by_code(code):
    """Get a single college by code."""
    with get_db_cursor() as cur:
        cur.execute('SELECT code, name FROM colleges WHERE code = %s', (code,))
        return cur.fetchone()


def create(code, name):
    """Create a new college."""
    with get_db_cursor() as cur:
        cur.execute(
            'INSERT INTO colleges (code, name) VALUES (%s, %s) RETURNING code, name',
            (code, name)
        )
        return cur.fetchone()


def update(code, new_code, new_name):
    """Update a college by code."""
    with get_db_cursor() as cur:
        cur.execute(
            'UPDATE colleges SET code = %s, name = %s WHERE code = %s RETURNING code, name',
            (new_code, new_name, code)
        )
        return cur.fetchone()


def delete(code):
    """Delete a college by code."""
    with get_db_cursor() as cur:
        cur.execute(
            'DELETE FROM colleges WHERE code = %s RETURNING code, name',
            (code,)
        )
        return cur.fetchone()


def bulk_delete(codes):
    """Delete multiple colleges by codes."""
    with get_db_cursor() as cur:
        cur.execute(
            'DELETE FROM colleges WHERE code = ANY(%s) RETURNING code',
            (codes,)
        )
        return cur.fetchall()
