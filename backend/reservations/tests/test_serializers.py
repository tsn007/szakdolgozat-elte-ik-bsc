import pytest
from unittest.mock import patch, MagicMock
from rest_framework.exceptions import ValidationError
from datetime import date

from reservations.serializers import (
    CreateReservationSerializer, 
    ReservationItemSerializer,
    StatusChangeSerializer
)

class TestCreateReservationSerializer:

    def test_validation_passes_with_correct_dates(self):
        """Happy path: Start date is before end date, and no overlapping reservations."""
        serializer = CreateReservationSerializer()
        attrs = {
            'item': MagicMock(), # Mocking the Item instance
            'from_date': date(2024, 5, 1),
            'to_date': date(2024, 5, 10)
        }
        
        # We mock the database filter to return False for exists()
        with patch('reservations.serializers.Reservation.objects.filter') as mock_filter:
            mock_filter.return_value.exists.return_value = False
            
            validated_attrs = serializer.validate(attrs)
            
            assert validated_attrs == attrs
            mock_filter.assert_called_once()

    def test_validation_fails_when_from_date_is_later(self):
        """Start date is later than end date. Should raise ValidationError."""
        serializer = CreateReservationSerializer()
        attrs = {
            'item': MagicMock(),
            'from_date': date(2024, 5, 10), # Later date
            'to_date': date(2024, 5, 1)     # Earlier date
        }
        
        with pytest.raises(ValidationError) as excinfo:
            serializer.validate(attrs)
            
        assert "from_date" in excinfo.value.detail
        assert "can not be later" in str(excinfo.value.detail["from_date"]) #type: ignore

    def test_validation_fails_on_overlapping_reservation(self):
        """Database returns True for overlapping reservations. Should raise ValidationError."""
        serializer = CreateReservationSerializer()
        attrs = {
            'item': MagicMock(),
            'from_date': date(2024, 6, 1),
            'to_date': date(2024, 6, 5)
        }
        
        # We mock the database to simulate that the item is already booked
        with patch('reservations.serializers.Reservation.objects.filter') as mock_filter:
            mock_filter.return_value.exists.return_value = True
            
            with pytest.raises(ValidationError) as excinfo:
                serializer.validate(attrs)
                
            assert "already booked" in str(excinfo.value.detail[0]) #type: ignore

class TestReservationItemSerializer:

    def test_nested_serialization_structure(self):
        """Verifies that nested location and owner data are serialized correctly."""
        
        # 1. Setup mock objects for relationships
        mock_location = MagicMock()
        mock_location.id = 1
        mock_location.address = "123 Test Avenue"
        
        mock_owner = MagicMock()
        mock_owner.id = 5
        mock_owner.first_name = "John"
        mock_owner.last_name = "Doe"
        mock_owner.profile_pic = "profile.jpg"
        
        # 2. Setup the main mock item
        mock_item = MagicMock()
        mock_item.id = 10
        mock_item.name = "Power Drill"
        mock_item.cover = "drill.jpg"
        mock_item.location = mock_location
        mock_item.owner = mock_owner

        # 3. Serialize
        serializer = ReservationItemSerializer(mock_item)
        data = serializer.data

        # 4. Assert structure
        assert data['id'] == '10'
        assert data['name'] == "Power Drill"
        
        # Assert Nested Location
        assert 'location' in data
        assert data['location']['address'] == "123 Test Avenue"
        
        # Assert Nested Owner
        assert 'owner' in data
        assert data['owner']['first_name'] == "John"

class TestStatusChangeSerializer:

    def test_id_is_read_only(self):
        """Ensures the 'id' field cannot be modified during a status change."""
        data = {
            "id": 999, # Trying to maliciously change the ID
            "status": "ACCEPTED"
        }
        
        serializer = StatusChangeSerializer(data=data)
        assert serializer.is_valid() is True
        
        # The validated_data should strip out the 'id' because it's read-only
        assert 'id' not in serializer.validated_data
        assert serializer.validated_data['status'] == "ACCEPTED"