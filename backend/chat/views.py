from rest_framework import generics
from django.db.models import Q
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, serializers
from drf_spectacular.utils import extend_schema, inline_serializer

from reservations.models import Reservation
from chat.serializers import ConversationSerializer, CreateMessageSerializer, MessageSerializer
from chat.models import Conversation, Message

class MessagePagination(PageNumberPagination):
    page_size = 10

class GetConversations(generics.ListAPIView):
    serializer_class = ConversationSerializer

    def get_queryset(self):
        qs = Conversation.objects.filter(Q(reservation__renter=self.request.user) | Q(reservation__item__owner=self.request.user)).exclude(reservation__status__in=[Reservation.Status.REJECTED, Reservation.Status.COMPLETED])
        return qs.order_by('-updated_at')
    
class ConversationMessagesView(generics.ListCreateAPIView):
    pagination_class = MessagePagination

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateMessageSerializer
        return MessageSerializer

    def get_queryset(self):
        conv_id = self.kwargs.get('conversation_id')
        qs = Message.objects.filter(
            conversation_id=conv_id
        ).filter(
            Q(conversation__reservation__renter=self.request.user) | 
            Q(conversation__reservation__item__owner=self.request.user)
        )
        return qs.order_by('-created_at')

    def perform_create(self, serializer):
        conv_id = self.kwargs.get('conversation_id')
        user = self.request.user
        
        conversation = get_object_or_404(
            Conversation.objects.filter(
                Q(reservation__renter=user) | Q(reservation__item__owner=user)
            ),
            id=conv_id
        )

        new_message = serializer.save(
            sender=user, 
            conversation=conversation
        )

        channel_layer = get_channel_layer()
        room_group_name = f'chat_{conversation.id}'
        message_data = MessageSerializer(new_message, context={'request': self.request}).data
        
        if channel_layer is not None:
            async_to_sync(channel_layer.group_send)(
                room_group_name,
                {
                    'type': 'chat_message',
                    'message': message_data
                }
            )

@extend_schema(
        request=None,      
        responses={
            200: inline_serializer(
                name='MarkMessagesReadResponse',
                fields={
                    'updated_count': serializers.IntegerField(
                        help_text="Number of messages set to read"
                    )
                }
            )
        },
        description="A beszélgetésben lévő, a másik fél által küldött olvasatlan üzenetek olvasottá tétele."
    )
class MarkMessagesReadView(APIView):
    def post(self, request, conversation_id):
        user = request.user
        
        updated_count = Message.objects.filter(
            conversation_id=conversation_id,
            is_read=False
        ).exclude(sender=user).update(is_read=True)

        if updated_count > 0:
            channel_layer = get_channel_layer()
            room_group_name = f'chat_{conversation_id}'
            
            if channel_layer is not None:
                async_to_sync(channel_layer.group_send)(
                    room_group_name,
                    {
                        'type': 'messages_read', 
                        'reader_email': user.email
                    }
                )

        return Response({"updated_count": updated_count}, status=status.HTTP_200_OK)
