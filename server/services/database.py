"""
PostgreSQL database connection pool using psycopg2.
Connects directly to Supabase's PostgreSQL database for raw SQL queries.
"""
import os
from contextlib import contextmanager
from psycopg2 import pool
from psycopg2.extras import RealDictCursor

# Connection pool - initialized lazily
_connection_pool = None


def get_connection_pool():
    """Get or create the connection pool."""
    global _connection_pool
    
    if _connection_pool is None:
        database_url = os.environ.get("DATABASE_URL")
        
        if not database_url:
            raise ValueError(
                "DATABASE_URL environment variable is required. "
                "Get it from Supabase Dashboard > Settings > Database > Connection string"
            )
        
        _connection_pool = pool.ThreadedConnectionPool(
            minconn=1,
            maxconn=10,
            dsn=database_url
        )
    
    return _connection_pool


@contextmanager
def get_db_connection():
    """
    Context manager for database connections.
    Automatically returns connection to pool after use.
    
    Usage:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM students")
                rows = cur.fetchall()
    """
    pool = get_connection_pool()
    conn = pool.getconn()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        pool.putconn(conn)


@contextmanager
def get_db_cursor(cursor_factory=RealDictCursor):
    """
    Context manager that provides a cursor with automatic connection handling.
    Returns rows as dictionaries by default.
    
    Usage:
        with get_db_cursor() as cur:
            cur.execute("SELECT * FROM students")
            rows = cur.fetchall()
    """
    with get_db_connection() as conn:
        cursor = conn.cursor(cursor_factory=cursor_factory)
        try:
            yield cursor
        finally:
            cursor.close()


def close_pool():
    """Close all connections in the pool. Call on app shutdown."""
    global _connection_pool
    if _connection_pool is not None:
        _connection_pool.closeall()
        _connection_pool = None
