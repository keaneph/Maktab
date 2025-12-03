from services.database import get_db_cursor


def get_all():
    """Get all programs ordered by code."""
    with get_db_cursor() as cur:
        cur.execute('SELECT code, name, college_code FROM programs ORDER BY code')
        return cur.fetchall()


def get_by_code(code):
    """Get a single program by code."""
    with get_db_cursor() as cur:
        cur.execute('SELECT code, name, college_code FROM programs WHERE code = %s', (code,))
        return cur.fetchone()


def create(code, name, college_code):
    """Create a new program."""
    with get_db_cursor() as cur:
        cur.execute(
            'INSERT INTO programs (code, name, college_code) VALUES (%s, %s, %s) RETURNING code, name, college_code',
            (code, name, college_code)
        )
        return cur.fetchone()


def update(code, new_code, new_name, new_college_code):
    """Update a program by code."""
    with get_db_cursor() as cur:
        cur.execute(
            'UPDATE programs SET code = %s, name = %s, college_code = %s WHERE code = %s RETURNING code, name, college_code',
            (new_code, new_name, new_college_code, code)
        )
        return cur.fetchone()


def delete(code):
    """Delete a program by code."""
    with get_db_cursor() as cur:
        cur.execute(
            'DELETE FROM programs WHERE code = %s RETURNING code, name, college_code',
            (code,)
        )
        return cur.fetchone()


def bulk_delete(codes):
    """Delete multiple programs by codes."""
    with get_db_cursor() as cur:
        cur.execute(
            'DELETE FROM programs WHERE code = ANY(%s) RETURNING code',
            (codes,)
        )
        return cur.fetchall()
