from services.database import get_db_cursor


def get_all():
    """Get all students ordered by idNo."""
    with get_db_cursor() as cur:
        cur.execute('''
            SELECT "idNo", "firstName", "lastName", "college_code", course, year, gender, photo_path 
            FROM students 
            ORDER BY "idNo"
        ''')
        return cur.fetchall()


def get_by_id(id_no):
    """Get a single student by idNo."""
    with get_db_cursor() as cur:
        cur.execute('''
            SELECT "idNo", "firstName", "lastName", "college_code", course, year, gender, photo_path 
            FROM students 
            WHERE "idNo" = %s
        ''', (id_no,))
        return cur.fetchone()


def create(id_no, first_name, last_name, course, year, gender, photo_path):
    """Create a new student."""
    with get_db_cursor() as cur:
        cur.execute('''
            INSERT INTO students ("idNo", "firstName", "lastName", course, year, gender, photo_path, college_code) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, (SELECT college_code FROM programs WHERE code = %s)) 
            RETURNING "idNo", "firstName", "lastName", "college_code", course, year, gender, photo_path
        ''', (id_no, first_name, last_name, course, year, gender, photo_path, course))
        return cur.fetchone()


def update(id_no, new_id_no, first_name, last_name, course, year, gender, photo_path):
    """Update a student by idNo."""
    with get_db_cursor() as cur:
        cur.execute('''
            UPDATE students 
            SET "idNo" = %s, "firstName" = %s, "lastName" = %s, course = %s, year = %s, gender = %s, photo_path = %s, 
                college_code = (SELECT college_code FROM programs WHERE code = %s) 
            WHERE "idNo" = %s 
            RETURNING "idNo", "firstName", "lastName", "college_code", course, year, gender, photo_path
        ''', (new_id_no, first_name, last_name, course, year, gender, photo_path, course, id_no))
        return cur.fetchone()


def delete(id_no):
    """Delete a student by idNo."""
    with get_db_cursor() as cur:
        cur.execute('''
            DELETE FROM students WHERE "idNo" = %s 
            RETURNING "idNo", "firstName", "lastName", "college_code", course, year, gender, photo_path
        ''', (id_no,))
        return cur.fetchone()


def bulk_delete(ids):
    """Delete multiple students by idNo."""
    with get_db_cursor() as cur:
        cur.execute(
            'DELETE FROM students WHERE "idNo" = ANY(%s) RETURNING "idNo"',
            (ids,)
        )
        return cur.fetchall()
