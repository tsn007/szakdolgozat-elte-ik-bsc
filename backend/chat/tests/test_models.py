import pytest
from unittest.mock import patch
from datetime import timedelta
from django.utils import timezone

from users.models import User
from categories.models import Category
from items.models import Item, Location
from reservations.models import Reservation
from chat.models import Conversation, Message

@pytest.fixture
def chat_data():
    owner = User.objects.create_user(email="owner@example.com", password="pw", first_name="A", last_name="B")
    renter = User.objects.create_user(email="renter@example.com", password="pw", first_name="C", last_name="D")
    
    category = Category.objects.create(name="Chat Tools", slug="chat-tools")
    location = Location.objects.create(user=owner, address="123", lat=0.0, lng=0.0)
    
    item = Item.objects.create(name="Item", price=10.0, category=category, location=location, owner=owner)

    reservation = Reservation.objects.create(
        item=item,
        renter=renter,
        from_date=timezone.now(),
        to_date=timezone.now() + timedelta(days=2),
        total_price=10.0
    )
    
    conversation = Conversation.objects.create(reservation=reservation)
    
    return {
        "owner": owner, 
        "renter": renter, 
        "conversation": conversation
    }

@pytest.mark.django_db
class TestMessageSignals:

    @patch('chat.models.timezone.now')
    def test_update_conversation_on_new_message(self, mock_timezone, chat_data):
        conversation = chat_data["conversation"]
        renter = chat_data["renter"]
        
        original_updated_at = conversation.updated_at
        
        future_time = original_updated_at + timedelta(hours=1)
        mock_timezone.return_value = future_time

        Message.objects.create(
            conversation=conversation,
            sender=renter,
            content="Hello, is the item ready?"
        )
        
        conversation.refresh_from_db()
        
        assert conversation.updated_at == future_time
        assert conversation.updated_at > original_updated_at

    def test_conversation_not_updated_on_message_edit(self, chat_data):
        conversation = chat_data["conversation"]
        renter = chat_data["renter"]
        
        msg = Message.objects.create(
            conversation=conversation,
            sender=renter,
            content="Test message"
        )
        
        conversation.refresh_from_db()
        timestamp_after_creation = conversation.updated_at
        
        msg.is_read = True
        msg.save()
        
        conversation.refresh_from_db()
        assert conversation.updated_at == timestamp_after_creation


@pytest.mark.django_db
class TestMessageModel:

    def test_message_ordering(self, chat_data):
        conversation = chat_data["conversation"]
        owner = chat_data["owner"]
        renter = chat_data["renter"]

        msg1 = Message.objects.create(conversation=conversation, sender=renter, content="First")
        msg2 = Message.objects.create(conversation=conversation, sender=owner, content="Second")
        msg3 = Message.objects.create(conversation=conversation, sender=renter, content="Third")

        messages = list(conversation.messages.all())

        assert len(messages) == 3
        assert messages[0].content == "First"
        assert messages[1].content == "Second"
        assert messages[2].content == "Third"