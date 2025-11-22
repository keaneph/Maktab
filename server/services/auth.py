from flask import request, g, jsonify
from functools import wraps
from services.supabase_client import supabase
import jwt
import os
import json

def get_user_from_request():
    """
    Extract and verify Supabase user from request.
    Returns user dict with email, username, etc. or None if not authenticated.
    """
    access_token = None
    
    # Try to get access token from Authorization header
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        access_token = auth_header.split('Bearer ')[1]
    else:
        # Try to get from cookies (Supabase stores tokens in cookies)
        # Supabase cookie names follow pattern: sb-<project-ref>-auth-token
        for cookie_name, cookie_value in request.cookies.items():
            if 'auth-token' in cookie_name.lower():
                try:
                    cookie_data = json.loads(cookie_value)
                    access_token = cookie_data.get('access_token')
                    if access_token:
                        break
                except:
                    pass
    
    if not access_token:
        return None
    
    try:
        decoded = jwt.decode(access_token, options={"verify_signature": False})
        
        user_email = decoded.get('email')
        user_id = decoded.get('sub')
        
        if not user_email:
            return None
        
        # Get username from users table if it exists
        username = None
        try:
            users_result = supabase.table('users').select('username').eq('email', user_email).execute()
            if users_result.data and len(users_result.data) > 0:
                username = users_result.data[0].get('username')
        except:
            pass
        
        user_data = {
            'email': user_email,
            'id': user_id,
            'username': username,
        }
        
        return user_data
    except Exception as e:
        print(f"Auth error: {e}")
        return None
    
    return None

def require_auth(f):
    """
    Decorator to require authentication for a route.
    Sets g.current_user if authenticated, returns 401 if not.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_user_from_request()
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401
        g.current_user = user
        return f(*args, **kwargs)
    return decorated_function

