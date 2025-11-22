from flask import Flask, jsonify, g
from flask_cors import CORS
import os
from routes.colleges import colleges_bp
from routes.programs import programs_bp
from routes.students import students_bp
from routes.users import users_bp
from routes.metrics import metrics_bp
from services.auth import get_user_from_request

app = Flask(__name__)

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

if __name__ == "__main__":
    app.run(debug=True)
