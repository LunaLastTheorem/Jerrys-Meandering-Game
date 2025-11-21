from flask import Flask, jsonify
from flask_cors import CORS
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import os, certifi
from dotenv import load_dotenv

app = Flask(__name__)
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

if __name__ == "__main__":
    app.run(debug=True)