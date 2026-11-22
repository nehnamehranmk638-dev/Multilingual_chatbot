import os
from pymongo import MongoClient
from bson import ObjectId
from decouple import config

try:
    import certifi
    ca_file = certifi.where()
except Exception:
    ca_file = None

MONGO_URI = (
    config("MONGO_URI", default=None)
    or config("MONGODB_URI", default=None)
    or os.environ.get("MONGO_URI")
    or os.environ.get("MONGODB_URI")
    or "mongodb://localhost:27017"
)

mongo_kwargs = {
    "serverSelectionTimeoutMS": 30000,
    "connectTimeoutMS": 20000,
    "socketTimeoutMS": 30000,
    "maxPoolSize": 50,
    "retryWrites": True,
}
if ca_file:
    mongo_kwargs["tlsCAFile"] = ca_file

client = MongoClient(MONGO_URI, **mongo_kwargs)

db = client["iiitk_chatbot"]

knowledge_base = db["knowledge_base"]
messages = db["messages"]
feedback = db["feedback"]