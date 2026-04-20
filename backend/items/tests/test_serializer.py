import pytest
from unittest.mock import patch, MagicMock
from django.utils import timezone
from datetime import timedelta

from items.serializers import ItemResponseSerializer, CreateItemSerializer

class TestItemResponseSerializer:

    @patch('items.serializers.ItemAvailabiltySerializer')
    def test_get_reservations_filters_correctly(self, mock_availability_serializer):
        """
        Tests that get_reservations only returns reservations that are 
        in the future AND have the correct status.
        """
        serializer = ItemResponseSerializer()
        
        # 1. Setup mock dates
        future_date = timezone.now() + timedelta(days=5)
        past_date = timezone.now() - timedelta(days=5)

        # 2. Setup mock reservations
        valid_res = MagicMock()
        valid_res.status = 'ACCEPTED'
        valid_res.to_date = future_date

        invalid_status_res = MagicMock()
        invalid_status_res.status = 'REJECTED' # Invalid status
        invalid_status_res.to_date = future_date

        invalid_date_res = MagicMock()
        invalid_date_res.status = 'PENDING'
        invalid_date_res.to_date = past_date # Invalid date (in the past)

        # 3. Setup mock item
        mock_item = MagicMock()
        mock_item.reservations.all.return_value = [
            valid_res, invalid_status_res, invalid_date_res
        ]

        # Mock the serializer return data to avoid complex nested mocking
        mock_availability_serializer.return_value.data = [{"mocked": "data"}]

        # 4. Execute the method
        serializer.get_reservations(mock_item)

        # 5. Assertions
        # Ensure ItemAvailabiltySerializer was called with ONLY the valid_res
        called_args, called_kwargs = mock_availability_serializer.call_args
        passed_reservations = called_args[0]
        
        assert len(passed_reservations) == 1
        assert passed_reservations[0] == valid_res

class TestCreateItemSerializer:

    @patch('items.serializers.ItemImage.objects.create')
    @patch('items.serializers.Item.objects.create')
    def test_create_item_with_images_from_request(self, mock_item_create, mock_item_image_create):
        """
        Verifies that if images are provided in the request context, 
        ItemImage objects are created for each uploaded file.
        """
        # 1. Mock the Request and Files
        mock_request = MagicMock()
        mock_image_1 = MagicMock()
        mock_image_2 = MagicMock()
        
        # Simulate request.FILES.getlist('images') returning two files
        mock_request.FILES.getlist.return_value = [mock_image_1, mock_image_2]

        # 2. Setup the Serializer with the mocked request context
        serializer = CreateItemSerializer(context={'request': mock_request})
        validated_data = {
            'name': 'Test Item',
            'price': 1000
        }

        # Mock the returned created item
        mock_created_item = MagicMock()
        mock_item_create.return_value = mock_created_item

        # 3. Execute create
        result = serializer.create(validated_data)

        # 4. Assertions
        mock_item_create.assert_called_once_with(**validated_data)
        
        # Check if ItemImage.objects.create was called twice (once for each image)
        assert mock_item_image_create.call_count == 2
        
        # Verify it was called with the correct item and image data
        mock_item_image_create.assert_any_call(item=mock_created_item, image=mock_image_1)
        mock_item_image_create.assert_any_call(item=mock_created_item, image=mock_image_2)
        
        assert result == mock_created_item

    @patch('items.serializers.ItemImage.objects.create')
    @patch('items.serializers.Item.objects.create')
    def test_create_item_without_request_context(self, mock_item_create, mock_item_image_create):
        """
        Ensures the serializer doesn't crash if instantiated without a request context
        (e.g., during internal backend operations).
        """
        serializer = CreateItemSerializer() # No context provided
        validated_data = {'name': 'No Context Item'}

        serializer.create(validated_data)

        # Item should be created, but no images should be processed
        mock_item_create.assert_called_once()
        mock_item_image_create.assert_not_called()