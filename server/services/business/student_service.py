from repositories import student_repository


def _format_student(row):
    """Format a student row from the database."""
    return {
        "idNo": row["idNo"],
        "firstName": row["firstName"],
        "lastName": row["lastName"],
        "college_code": row.get("college_code"),
        "course": row.get("course"),
        "year": row.get("year"),
        "gender": row.get("gender"),
        "photo_path": row.get("photo_path"),
    }


def get_all():
    """Get all students."""
    rows = student_repository.get_all()
    return [_format_student(r) for r in rows]


def get_by_id(id_no):
    """Get a single student by idNo."""
    row = student_repository.get_by_id(id_no)
    return _format_student(row) if row else None


def create(id_no, first_name, last_name, course, year, gender, photo_path):
    """Create a new student."""
    row = student_repository.create(
        id_no, first_name, last_name, course, year, gender, photo_path
    )
    return _format_student(row)


def update(id_no, new_id_no, first_name, last_name, course, year, gender, photo_path):
    """Update a student by idNo."""
    row = student_repository.update(
        id_no, new_id_no, first_name, last_name, course, year, gender, photo_path
    )
    return _format_student(row) if row else None


def delete(id_no):
    """Delete a student by idNo."""
    row = student_repository.delete(id_no)
    return _format_student(row) if row else None


def bulk_delete(ids):
    """Delete multiple students by idNo."""
    deleted_rows = student_repository.bulk_delete(ids)
    return len(deleted_rows)
