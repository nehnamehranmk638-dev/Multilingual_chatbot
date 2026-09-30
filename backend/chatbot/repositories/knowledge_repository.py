from chatbot.db import knowledge_base


def insert_documents(documents):
    result = knowledge_base.insert_many(documents)
    return result.inserted_ids


def get_all_documents():
    return list(knowledge_base.find({}, {"_id": 0}))


def vector_search(query_vector, top_k=2):
    results = knowledge_base.aggregate([
        {
            "$vectorSearch": {
                "index": "vector_index",
                "path": "embedding",
                "queryVector": query_vector,
                "numCandidates": 50,
                "limit": top_k
            }
        },
        {
            "$project": {
                "_id": 0,
                "title": 1,
                "content": 1,
                "category": 1,
                "language": 1,
                "source": 1,
                "verified": 1
            }
        }
    ])

    return list(results)