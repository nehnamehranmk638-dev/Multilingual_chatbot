from django.urls import path
from .views import chat, speech_to_text


urlpatterns = [
    path('chat/', chat),
    path('speech/', speech_to_text),
]