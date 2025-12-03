from flask import Flask, jsonify, g, send_from_directory, request
from flask_cors import CORS
import os
import atexit
from routes.colleges import colleges_bp
from routes.programs import programs_bp
from routes.students import students_bp
from routes.users import users_bp
from routes.metrics import metrics_bp
from services.auth import get_user_from_request
from services.database import close_pool

CLIENT_BUILD_PATH = os.path.normpath(os.path.join(os.path.dirname(__file__), '..', 'client', 'out'))

app = Flask(__name__)

# Register cleanup function to close database pool on shutdown
atexit.register(close_pool)

app.register_blueprint(colleges_bp)
app.register_blueprint(metrics_bp)
app.register_blueprint(programs_bp)
app.register_blueprint(students_bp)
app.register_blueprint(users_bp)

CORS(
    app,
    supports_credentials=True,
    origins=["http://localhost:3000", "http://127.0.0.1:3000"]
)

@app.before_request
def load_user():
    g.current_user = get_user_from_request()

@app.route("/api/home", methods=["GET"])
def home():
    return jsonify({"message": "wakey wakey flask is awakey"})

# Serve static files and handle SPA routing
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_static(path):
    # Don't intercept API routes (they're handled by blueprints)
    if path.startswith('api/') or path == 'api':
        return jsonify({"error": "Not found"}), 404
    
    # Normalize path separators for Windows
    path = path.replace('\\', '/')
    
    # Remove trailing slash for file lookup
    clean_path = path.rstrip('/')
    
    # Try to serve the exact file (for assets like .js, .css, images)
    full_path = os.path.join(CLIENT_BUILD_PATH, clean_path)
    if os.path.isfile(full_path):
        directory = os.path.dirname(full_path)
        filename = os.path.basename(full_path)
        return send_from_directory(directory, filename)
    
    # For routes like /dashboard or /dashboard/, serve /dashboard/index.html
    index_path = os.path.join(CLIENT_BUILD_PATH, clean_path, 'index.html')
    if os.path.isfile(index_path):
        return send_from_directory(os.path.join(CLIENT_BUILD_PATH, clean_path), 'index.html')
    
    # For root path
    if not clean_path:
        return send_from_directory(CLIENT_BUILD_PATH, 'index.html')
    
    # Fallback to root index.html for client-side routing
    return send_from_directory(CLIENT_BUILD_PATH, 'index.html')

if __name__ == "__main__":
    app.run(debug=True)
