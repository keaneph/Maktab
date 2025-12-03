from repositories import user_repository


def _format_user(row):
    """Format a user row from the database."""
    return {
        "email": row["email"],
    }


def get_all():
    """Get all users."""
    rows = user_repository.get_all()
    return [_format_user(r) for r in rows]


def get_by_email(email):
    """Get a single user by email."""
    row = user_repository.get_by_email(email)
    return _format_user(row) if row else None
