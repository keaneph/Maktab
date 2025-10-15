from flask import Flask, jsonify
from flask_cors import CORS
import os
from routes.colleges import colleges_bp
from routes.programs import programs_bp
from routes.students import students_bp
from routes.auth import auth_bp
from routes.users import users_bp
from db import init_pool, close_all

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
CORS(app, supports_credentials=True, origins=["http://localhost:3000", "http://127.0.0.1:3000"])  # allow next.js frontend to call with cookies

# initialize a global database connection pool
init_pool(minconn=1, maxconn=10)

@app.route("/api/home", methods=["GET"])
def home():
    return jsonify({"message": "Backend is working!"})

# register blueprints
app.register_blueprint(colleges_bp)
app.register_blueprint(programs_bp)
app.register_blueprint(students_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(users_bp)

if __name__ == "__main__":
    app.run(debug=True)
