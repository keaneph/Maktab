from flask import Flask, jsonify
from flask_cors import CORS
from routes.colleges import colleges_bp
from routes.programs import programs_bp
from routes.students import students_bp
from db import init_pool, close_all

app = Flask(__name__)
CORS(app)  # allow next.js frontend to call

# initialize a global database connection pool
init_pool(minconn=1, maxconn=10)

@app.route("/api/home", methods=["GET"])
def home():
    return jsonify({"message": "Backend is working!"})

# register blueprints
app.register_blueprint(colleges_bp)
app.register_blueprint(programs_bp)
app.register_blueprint(students_bp)

if __name__ == "__main__":
    app.run(debug=True)
