from flask import Blueprint, request, jsonify
from supabase_client import supabase

colleges_bp = Blueprint("colleges", __name__, url_prefix="/api/colleges")

# GET all colleges
@colleges_bp.route("/", methods=["GET"])
def get_colleges():
    response = supabase.table("colleges").select("*").execute()
    return jsonify(response.data), 200

# POST create a new college
@colleges_bp.route("/", methods=["POST"])
def create_college():
    data = request.get_json()
    response = supabase.table("colleges").insert(data).execute()
    return jsonify(response.data), 201

# PUT update a college by id
@colleges_bp.route("/<int:id>", methods=["PUT"])
def update_college(id):
    data = request.get_json()
    response = supabase.table("colleges").update(data).eq("id", id).execute()
    return jsonify(response.data), 200

# DELETE a college by id
@colleges_bp.route("/<int:id>", methods=["DELETE"])
def delete_college(id):
    response = supabase.table("colleges").delete().eq("id", id).execute()
    return jsonify(response.data), 200
