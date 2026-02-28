from flask import Flask, jsonify, render_template, request
from flask_cors import CORS
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import os, certifi
from dotenv import load_dotenv
from datetime import datetime
from metrics import compute_metrics

app = Flask(__name__, static_url_path="", static_folder='../dist', template_folder='../dist')
CORS(app, origins=["http://localhost:8080"])

load_dotenv()
uri = os.getenv("URI")

client = MongoClient(uri, tlsCAFile=certifi.where(), server_api=ServerApi("1"))
db = client['jerrys-meandering-game']
collection = db['maps']

@app.route("/puzzle/<int:index>", methods=["GET"])
def get_puzzle(index):
    puzzle = collection.find_one({"index": index}, {"_id": 0})
    if puzzle:
        return jsonify(puzzle)
    else: 
        return jsonify({"error": "Puzzle not found :("}), 404

@app.route("/submit-puzzle", methods=["POST"])
def submit_puzzle():
    """
    Submit completed puzzle and compute metrics.
    
    Expected JSON payload:
    {
        "puzzle_id": int,
        "districts": [
            {
                "id": int,
                "cells": [[row, col], [row, col], ...],
                "votes_party_a": int,
                "votes_party_b": int
            },
        ],
        "total_votes_party_a": int,
        "total_votes_party_b": int
    }
    """
    try:
        data = request.get_json()
        
        required_fields = ['districts', 'total_votes_party_a', 'total_votes_party_b']
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400
        
        districts = data.get('districts', [])
        total_votes_a = data.get('total_votes_party_a', 0)
        total_votes_b = data.get('total_votes_party_b', 0)
        puzzle_id = data.get('puzzle_id')
        
        metrics_result = compute_metrics(districts, total_votes_a, total_votes_b)
        metrics_result['timestamp'] = datetime.now().isoformat()
        metrics_result['puzzle_id'] = puzzle_id
        
        # Store in database for future???
        if puzzle_id:
            try:
                results_collection = db['puzzle_results']
                results_collection.insert_one(metrics_result)
            except Exception as e:
                print(f"Warning: Could not store results in database: {e}")
        
        return jsonify(metrics_result), 200
    
    except Exception as e:
        print(f"Error computing metrics: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/")
def serve():
    try:
        return render_template("index.html")
    except Exception as e:
        print(f"not running static site {e}")
    return "insert game here"

if __name__ == "__main__":
    app.run(debug=True)