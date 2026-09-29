from chatbot.db import knowledge_base


def insert_documents(documents):
    result = knowledge_base.insert_many(documents)
    return result.inserted_ids


def get_all_documents():
    return list(knowledge_base.find({}, {"_id": 0}))