import os
from typing import Optional
from psycopg2.pool import SimpleConnectionPool
from dotenv import load_dotenv

load_dotenv()

_POOL: Optional[SimpleConnectionPool] = None

def init_pool(minconn: int = 1, maxconn: int = 10) -> None:
    global _POOL
    if _POOL is None:
        dsn = os.getenv("SUPABASE_DB_URL")
        if not dsn:
            raise RuntimeError("SUPABASE_DB_URL is not set")
        _POOL = SimpleConnectionPool(minconn, maxconn, dsn)

def get_conn():
    if _POOL is None:
        raise RuntimeError("Connection pool not initialized. Call init_pool() first.")
    return _POOL.getconn()

def put_conn(conn) -> None:
    if _POOL is None:
        raise RuntimeError("Connection pool not initialized. Call init_pool() first.")
    _POOL.putconn(conn)

def close_all() -> None:
    global _POOL
    if _POOL is not None:
        _POOL.closeall()
        _POOL = None


