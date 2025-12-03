from repositories import program_repository


def _format_program(row):
    """Format a program row from the database."""
    return {
        "code": row["code"],
        "name": row["name"],
        "college_code": row["college_code"],
    }


def get_all():
    """Get all programs."""
    rows = program_repository.get_all()
    return [_format_program(r) for r in rows]


def get_by_code(code):
    """Get a single program by code."""
    row = program_repository.get_by_code(code)
    return _format_program(row) if row else None


def create(code, name, college_code):
    """Create a new program."""
    row = program_repository.create(code, name, college_code)
    return _format_program(row)


def update(code, new_code, new_name, new_college_code):
    """Update a program by code."""
    row = program_repository.update(code, new_code, new_name, new_college_code)
    return _format_program(row) if row else None


def delete(code):
    """Delete a program by code."""
    row = program_repository.delete(code)
    return _format_program(row) if row else None


def bulk_delete(codes):
    """Delete multiple programs by codes."""
    deleted_rows = program_repository.bulk_delete(codes)
    return len(deleted_rows)
