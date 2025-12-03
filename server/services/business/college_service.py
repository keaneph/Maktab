from repositories import college_repository


def _format_college(row):
    """Format a college row from the database."""
    return {
        "code": row["code"],
        "name": row["name"],
    }


def get_all():
    """Get all colleges."""
    rows = college_repository.get_all()
    return [_format_college(r) for r in rows]


def get_by_code(code):
    """Get a single college by code."""
    row = college_repository.get_by_code(code)
    return _format_college(row) if row else None


def create(code, name):
    """Create a new college."""
    row = college_repository.create(code, name)
    return _format_college(row)


def update(code, new_code, new_name):
    """Update a college by code."""
    row = college_repository.update(code, new_code, new_name)
    return _format_college(row) if row else None


def delete(code):
    """Delete a college by code."""
    row = college_repository.delete(code)
    return _format_college(row) if row else None


def bulk_delete(codes):
    """Delete multiple colleges by codes."""
    deleted_rows = college_repository.bulk_delete(codes)
    return len(deleted_rows)
