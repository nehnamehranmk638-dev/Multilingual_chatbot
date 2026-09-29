from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['POST'])
def chat(request):
    user_message = request.data.get('message', '')
    # No AI yet — just prove the pipes work
    reply = f"You said: {user_message}"
    return Response({"answer": reply})