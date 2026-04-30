from unittest.mock import MagicMock, patch

from chat.serializers import (
    ConversationSerializer, 
    MessageSerializer,
    CreateMessageSerializer
)

class TestConversationSerializer:

    @patch('chat.serializers.ParticipantSerializer')
    def test_get_other_when_current_user_is_renter(self, mock_participant_serializer):
        mock_current_user_renter = MagicMock()
        mock_item_owner = MagicMock()

        mock_request = MagicMock()
        mock_request.user = mock_current_user_renter

        mock_conversation = MagicMock()
        mock_conversation.reservation.renter = mock_current_user_renter
        mock_conversation.reservation.item.owner = mock_item_owner

        mock_participant_serializer.return_value.data = {"role": "owner_data"}

        serializer = ConversationSerializer(context={'request': mock_request})
        
        result = serializer.get_other(mock_conversation)

        mock_participant_serializer.assert_called_once_with(mock_item_owner)
        assert result == {"role": "owner_data"}

    @patch('chat.serializers.ParticipantSerializer')
    def test_get_other_when_current_user_is_owner(self, mock_participant_serializer):
        mock_current_user_owner = MagicMock()
        mock_renter = MagicMock()

        mock_request = MagicMock()
        mock_request.user = mock_current_user_owner

        mock_conversation = MagicMock()
        mock_conversation.reservation.renter = mock_renter
        mock_conversation.reservation.item.owner = mock_current_user_owner

        mock_participant_serializer.return_value.data = {"role": "renter_data"}

        serializer = ConversationSerializer(context={'request': mock_request})
        result = serializer.get_other(mock_conversation)

        mock_participant_serializer.assert_called_once_with(mock_renter)
        assert result == {"role": "renter_data"}

    def test_get_other_without_request_context(self):
        mock_conversation = MagicMock()
        
        serializer = ConversationSerializer(context={}) 
        result = serializer.get_other(mock_conversation)

        assert result is None


class TestMessageSerializer:

    def test_nested_sender_serialization(self):
        mock_sender = MagicMock()
        mock_sender.email = "chatuser@example.com"

        mock_message = MagicMock()
        mock_message.id = 1
        mock_message.conversation_id = 100
        mock_message.sender = mock_sender
        mock_message.content = "Is the item still available?"
        mock_message.is_read = False
        mock_message.created_at = "2024-01-01T10:00:00Z"

        serializer = MessageSerializer(mock_message)
        data = serializer.data

        assert data['content'] == "Is the item still available?"
        assert data['is_read'] is False
        assert 'sender' in data
        assert data['sender']['email'] == "chatuser@example.com"


class TestCreateMessageSerializer:

    def test_valid_message_content(self):
        data = {"content": "Yes, it is available!"}
        serializer = CreateMessageSerializer(data=data)
        
        assert serializer.is_valid() is True
        assert serializer.validated_data['content'] == "Yes, it is available!"