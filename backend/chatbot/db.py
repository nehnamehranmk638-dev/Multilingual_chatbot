from pymongo import MongoClient
from bson import ObjectId
from decouple import config

# Ensure DNS resolution works reliably even on restrictive local networks
try:
    import dns.resolver
    dns.resolver.default_resolver = dns.resolver.Resolver()
    dns.resolver.default_resolver.nameservers = ['8.8.8.8', '1.1.1.1']
except Exception:
    pass

try:
    import certifi
    ca_file = certifi.where()
except Exception:
    ca_file = None

MONGO_URI = config("MONGO_URI", default=None) or config("MONGODB_URI")

mongo_kwargs = {
    "serverSelectionTimeoutMS": 5000,
}
if ca_file:
    mongo_kwargs["tlsCAFile"] = ca_file

client = MongoClient(MONGO_URI, **mongo_kwargs)

db = client["iiitk_chatbot"]

knowledge_base = db["knowledge_base"]
messages = db["messages"]
feedback = db["feedback"]