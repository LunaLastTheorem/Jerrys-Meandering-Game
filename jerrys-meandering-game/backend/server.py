from flask import Flask, jsonify, render_template
from flask_cors import CORS
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from pathlib import Path
import os, certifi
from dotenv import load_dotenv

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

@app.route("/")
def serve():
    try:
        return render_template("index.html")
    except Exception as e:
        print(f"not running static site {e}")
    return "insert game here"

if __name__ == "__main__":
    app.run(debug=True)