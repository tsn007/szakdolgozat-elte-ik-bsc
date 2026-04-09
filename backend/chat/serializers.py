from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field

from items.models import Item
from reservations.models import Reservation
from users.models import User
from chat.models import Conversation, Message

class ParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'profile_pic']

class ConversationItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ['name']

class ConversationReservationSerializer(serializers.ModelSerializer):
    item = ConversationItemSerializer()
    class Meta:
        model = Reservation
        fields = ['id', 'item']

class ConversationSerializer(serializers.ModelSerializer):
    other = serializers.SerializerMethodField()
    reservation = ConversationReservationSerializer()
    class Meta:
        model = Conversation
        fields = ['id', 'updated_at', 'created_at', 'other', 'reservation']

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