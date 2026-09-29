from pymongo import MongoClient
from decouple import config

MONGO_URI = config("MONGO_URI")

client = MongoClient(MONGO_URI)

db = client["iiitk_chatbot"]

knowledge_base = db["knowledge_base"]
messages = db["messages"]