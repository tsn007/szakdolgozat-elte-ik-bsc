from unittest.mock import patch, MagicMock
from django.utils import timezone
from datetime import timedelta

from items.serializers import ItemResponseSerializer, CreateItemSerializer

class TestItemResponseSerializer:

    @patch('items.serializers.ItemAvailabiltySerializer')
    def test_get_reservations_filters_correctly(self, mock_availability_serializer):
        serializer = ItemResponseSerializer()
        
        future_date = timezone.now() + timedelta(days=5)
        past_date = timezone.now() - timedelta(days=5)

        valid_res = MagicMock()
        valid_res.status = 'ACCEPTED'
        valid_res.to_date = future_date

        invalid_status_res = MagicMock()
        invalid_status_res.status = 'REJECTED'
        invalid_status_res.to_date = future_date

        invalid_date_res = MagicMock()
        invalid_date_res.status = 'PENDING'
        invalid_date_res.to_date = past_date

        mock_item = MagicMock()
        mock_item.reservations.all.return_value = [
            valid_res, invalid_status_res, invalid_date_res
        ]

        mock_availability_serializer.return_value.data = [{"mocked": "data"}]

        serializer.get_reservations(mock_item)

        called_args, called_kwargs = mock_availability_serializer.call_args
        passed_reservations = called_args[0]
        
        assert len(passed_reservations) == 1
        assert passed_reservations[0] == valid_res

class TestCreateItemSerializer:

    @patch('items.serializers.ItemImage.objects.create')
    @patch('items.serializers.Item.objects.create')
    def test_create_item_with_images_from_request(self, mock_item_create, mock_item_image_create):
        mock_request = MagicMock()
        mock_image_1 = MagicMock()
        mock_image_2 = MagicMock()
        
        mock_request.FILES.getlist.return_value = [mock_image_1, mock_image_2]

        serializer = CreateItemSerializer(context={'request': mock_request})
        validated_data = {
            'name': 'Test Item',
            'price': 1000
        }

        mock_created_item = MagicMock()
        mock_item_create.return_value = mock_created_item

        result = serializer.create(validated_data)

        mock_item_create.assert_called_once_with(**validated_data)
        
        assert mock_item_image_create.call_count == 2
        
        mock_item_image_create.assert_any_call(item=mock_created_item, image=mock_image_1)
        mock_item_image_create.assert_any_call(item=mock_created_item, image=mock_image_2)
        
        assert result == mock_created_item

    @patch('items.serializers.ItemImage.objects.create')
    @patch('items.serializers.Item.objects.create')
    def test_create_item_without_request_context(self, mock_item_create, mock_item_image_create):
        serializer = CreateItemSerializer()
        validated_data = {'name': 'No Context Item'}

        serializer.create(validated_data)

        mock_item_create.assert_called_once()
        mock_item_image_create.assert_not_called()