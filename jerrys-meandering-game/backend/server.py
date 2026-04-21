from flask import Flask, jsonify, render_template, request
from flask_cors import CORS
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import os, certifi
from dotenv import load_dotenv
from datetime import datetime
from metrics import compute_metrics
from map_to_gerrychain import grid_to_graph, validate_submitted_districts, create_initial_partition
from adaptive_simulation import run_mcmc_simulation, compute_histogram_data, generate_histogram_png
from map_generator import generate_puzzle, generate_multiplayer_puzzle

app = Flask(__name__, static_url_path="", static_folder='../dist', template_folder='../dist')
CORS(app, origins=["http://localhost:8080"])

load_dotenv()
uri = os.getenv("URI")

client = MongoClient(uri, tlsCAFile=certifi.where(), server_api=ServerApi("1"))
db = client['jerrys-meandering-game']
collection = db['maps']

@app.route("/puzzle/multiplayer/<int:rows>/<int:cols>", methods = ['GET'])
def create_multiplayer_puzzle(rows = None, cols = None):
    if not rows or not cols:
        return jsonify({"error": "Missing Dimension"}), 404
    try:
        puzzle = generate_multiplayer_puzzle(rows, cols)
    except TypeError:
        return jsonify({"error": f"Invalid Dimension {rows} x {cols}"}), 500
    return jsonify(puzzle)

@app.route("/puzzle/<int:rows>/<int:cols>", methods = ['GET'])
def create_puzzle(rows = None, cols = None):
    '''
    Call this to make a new puzzle :D
    '''
    if not rows or not cols:
        return jsonify({"error": "Missing Dimension"}), 404
    try:
        puzzle = generate_puzzle(rows, cols)
    except TypeError:
        return jsonify({"error": f"Invalid Dimension {rows} x {cols}"}), 500
    return jsonify(puzzle)

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

@app.route("/evaluate-map", methods=["POST"])
def evaluate_map():
    """
    Run MCMC on submitted map to evaluate gerrymandering.

    Expected JSON payload:
    {
        "grid": [[row, col color], ...] // 2D array of cell colors
        "rows": int, // Grid height
        "cols": int, // Grid width
        "districts": [ // List of districts
            {
                "id": int,
                "cells": [[row, col], ...]
            },
        ]
    }
    """

    try:
        data = request.get_json()

        # Validate input
        required_fields = ['grid', 'rows', 'cols', 'districts']
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400
        
        grid_map = data.get('grid')
        rows = data.get('rows')
        cols = data.get('cols')
        districts_data = data.get('districts')

        # Extract district cells
        districts = [d['cells'] for d in districts_data]
        num_districts = len(districts)

        # Validate contiguity of submitted districts
        is_valid, error_msg = validate_submitted_districts(grid_map, districts)
        if not is_valid:
            return jsonify({"error": error_msg}), 400
        
        # Create graph and partition
        graph = grid_to_graph(grid_map, districts)
        partition = create_initial_partition(graph)

        # Run MCMC simulation
        results = run_mcmc_simulation(partition, num_districts, rows, cols)

        # Compute histogram data and generate PNG
        histogram_data = compute_histogram_data(results)
        histogram_png = generate_histogram_png(results)

        histogram_data['histogram_image'] = histogram_png

        return jsonify(histogram_data), 200

    except Exception as e:
        print(f"Error evaluating map: {e}")
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