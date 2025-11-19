import os
import certifi
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv

load_dotenv()
uri = os.getenv('URI')

client = MongoClient(uri, tlsCAFile=certifi.where(), server_api=ServerApi('1'))
db = client['jerrys-meandering-game']
collection = db['maps']

for x in collection.find():
    print(x)