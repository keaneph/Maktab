from flask import Flask, jsonify
from flask_cors import CORS
from routes.colleges import colleges_bp
from routes.programs import programs_bp

app = Flask(__name__)
CORS(app)  # allow next.js frontend to call

@app.route("/api/home", methods=["GET"])
def home():
    return jsonify({"message": "Backend is working!"})

# register blueprints
app.register_blueprint(colleges_bp)
app.register_blueprint(programs_bp)

if __name__ == "__main__":
    app.run(debug=True)
