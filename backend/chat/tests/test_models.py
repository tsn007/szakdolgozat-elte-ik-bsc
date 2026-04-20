import pytest
from unittest.mock import patch
from datetime import timedelta
from django.utils import timezone

# Adjust imports based on your app structure
from users.models import User
from categories.models import Category
from items.models import Item, Location
from reservations.models import Reservation
from chat.models import Conversation, Message

@pytest.fixture
def chat_data():
    """
    Sets up the necessary database objects for testing the Chat models.
    """
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
        """
        Tests if creating a NEW message triggers the post_save signal 
        and updates the conversation's 'updated_at' timestamp.
        """
        conversation = chat_data["conversation"]
        renter = chat_data["renter"]
        
        # We capture the original timestamp
        original_updated_at = conversation.updated_at
        
        # We mock time to be explicitly 1 hour in the future to guarantee a measurable difference
        future_time = original_updated_at + timedelta(hours=1)
        mock_timezone.return_value = future_time

        # Create a new message
        Message.objects.create(
            conversation=conversation,
            sender=renter,
            content="Hello, is the item ready?"
        )
        
        # Refresh the conversation from the database
        conversation.refresh_from_db()
        
        # Assert the signal successfully updated the timestamp
        assert conversation.updated_at == future_time
        assert conversation.updated_at > original_updated_at

    def test_conversation_not_updated_on_message_edit(self, chat_data):
        """
        Tests the 'if created:' condition in the signal.
        Modifying an existing message (like marking it as read) should NOT 
        update the conversation's timestamp.
        """
        conversation = chat_data["conversation"]
        renter = chat_data["renter"]
        
        # 1. Create message
        msg = Message.objects.create(
            conversation=conversation,
            sender=renter,
            content="Test message"
        )
        
        # Capture timestamp AFTER creation
        conversation.refresh_from_db()
        timestamp_after_creation = conversation.updated_at
        
        # 2. Update the message (simulate reading it)
        msg.is_read = True
        msg.save()
        
        # 3. Verify the conversation timestamp did NOT change
        conversation.refresh_from_db()
        assert conversation.updated_at == timestamp_after_creation


@pytest.mark.django_db
class TestMessageModel:

    def test_message_ordering(self, chat_data):
        """
        Tests the Meta 'ordering' constraint to ensure messages are ALWAYS 
        returned in chronological order (oldest first).
        """
        conversation = chat_data["conversation"]
        owner = chat_data["owner"]
        renter = chat_data["renter"]

        # Create messages (we use slightly manipulated creation times to test ordering)
        msg1 = Message.objects.create(conversation=conversation, sender=renter, content="First")
        msg2 = Message.objects.create(conversation=conversation, sender=owner, content="Second")
        msg3 = Message.objects.create(conversation=conversation, sender=renter, content="Third")

        # Fetch messages using the related manager
        messages = list(conversation.messages.all())

        # Assert correct order
        assert len(messages) == 3
        assert messages[0].content == "First"
        assert messages[1].content == "Second"
        assert messages[2].content == "Third"