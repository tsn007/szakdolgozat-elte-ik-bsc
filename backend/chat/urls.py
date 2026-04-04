from django.urls import path

from chat.views import GetConversations, ConversationMessagesView, MarkMessagesReadView

urlpatterns = [
    path('conversations/', GetConversations.as_view(), name='get_user_conversations'),
    path('conversations/<uuid:conversation_id>/messages/', ConversationMessagesView.as_view(), name='conversation_messages'),
    path('conversations/<uuid:conversation_id>/read/', MarkMessagesReadView.as_view(), name='mark_messages_as_read'),
]