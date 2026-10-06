from django.urls import path
from .views import chat, speech_to_text, submit_feedback
from .admin_views import (
    get_kb_docs,
    create_kb_doc,
    update_kb_doc,
    delete_kb_doc,
    get_escalations,
    resolve_escalation,
    get_feedback
)

urlpatterns = [
    path('chat/', chat, name='chat'),
    path('speech/', speech_to_text, name='speech'),
    path('feedback/', submit_feedback, name='feedback'),
    
    # Admin KB Routes
    path('admin/kb/', get_kb_docs, name='admin_kb_list'),
    path('admin/kb/create/', create_kb_doc, name='admin_kb_create'),
    path('admin/kb/<str:doc_id>/', update_kb_doc, name='admin_kb_update'),
    path('admin/kb/<str:doc_id>/delete/', delete_kb_doc, name='admin_kb_delete'),
    
    # Admin Escalation Routes
    path('admin/escalations/', get_escalations, name='admin_escalations_list'),
    path('admin/escalations/<str:esc_id>/resolve/', resolve_escalation, name='admin_escalation_resolve'),
    
    # Admin Feedback Routes
    path('admin/feedback/', get_feedback, name='admin_feedback_list'),

    
]