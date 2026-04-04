from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field

from users.models import User
from chat.models import Conversation, Message

class ParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'profile_pic']

class ConversationSerializer(serializers.ModelSerializer):
    other = serializers.SerializerMethodField()
    class Meta:
        model = Conversation
        fields = ['id', 'updated_at', 'created_at', 'other']

    @extend_schema_field(ParticipantSerializer)
    def get_other(self, obj):
        request = self.context.get('request')

        if request is None or not hasattr(request, 'user'):
            return None
        
        current_user = request.user

        renter = obj.reservation.renter
        owner = obj.reservation.item.owner

        if current_user == renter:
            other_user = owner
        else:
            other_user = renter

        return ParticipantSerializer(other_user).data

class MessageSenderSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email']

class MessageSerializer(serializers.ModelSerializer):
    sender = MessageSenderSerializer()
    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'content', 'is_read', 'created_at']

class CreateMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['content']