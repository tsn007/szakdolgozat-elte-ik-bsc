import pytest
from unittest.mock import patch, MagicMock
from rest_framework.exceptions import ValidationError

from users.serializers import (
    LoginSerializer, RegisterSerializer, UserDataSerializer,
    SuccessResponseSerializer, AddEditLocationSerializer, ReviewSerializer
)

class TestLoginSerializer:
    def test_valid_login_data(self):
        data = {"email": "test@example.com", "password": "securepassword123"}
        serializer = LoginSerializer(data=data)
        assert serializer.is_valid() is True

    def test_invalid_email_format(self):
        data = {"email": "not-an-email", "password": "securepassword123"}
        serializer = LoginSerializer(data=data)
        assert serializer.is_valid() is False
        assert "email" in serializer.errors

    def test_missing_required_fields(self):
        data = {"email": "test@example.com"}
        serializer = LoginSerializer(data=data)
        assert serializer.is_valid() is False
        assert "password" in serializer.errors

class TestSuccessResponseSerializer:
    def test_valid_message(self):
        serializer = SuccessResponseSerializer(data={"message": "Sikeres művelet!"})
        assert serializer.is_valid() is True

@pytest.mark.django_db
class TestRegisterSerializer:
    def test_passwords_matching(self):
        data = {
            "email": "new@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "password": "StrongPassword123!",
            "password_confirmation": "StrongPassword123!"
        }
        with patch('users.serializers.validate_password', return_value=None):
            serializer = RegisterSerializer(data=data)
            serializer.is_valid()
            assert "non_field_errors" not in serializer.errors

    def test_passwords_mismatch(self):
        data = {
            "email": "new@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "password": "StrongPassword123!",
            "password_confirmation": "DifferentPassword123!"
        }
        with patch('users.serializers.validate_password', return_value=None):
            serializer = RegisterSerializer(data=data)
            assert serializer.is_valid() is False
            assert serializer.errors['non_field_errors'][0] == 'Passwords not matching!'

    @patch('users.serializers.User.objects.create_user')
    def test_create_method_pops_confirmation(self, mock_create_user):
        serializer = RegisterSerializer()
        validated_data = {
            "email": "test@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "password": "password123",
            "password_confirmation": "password123"
        }
        
        serializer.create(validated_data)
        
        mock_create_user.assert_called_once()
        
        called_args, called_kwargs = mock_create_user.call_args
        assert "password_confirmation" not in called_kwargs
        assert called_kwargs["email"] == "test@example.com"
        assert called_kwargs["password"] == "password123"

class TestUserDataSerializer:
    def test_user_serialization(self):
        mock_user = MagicMock()
        mock_user.email = "admin@example.com"
        mock_user.first_name = "Admin"
        mock_user.last_name = "User"
        mock_user.profile_pic = "path/to/pic.jpg"
        mock_user.rating = 4.5
        mock_user.rating_count = 10
        mock_user.is_staff = True

        serializer = UserDataSerializer(mock_user)
        data = serializer.data

        assert data['email'] == "admin@example.com"
        assert data['rating'] == "4.5"
        assert data['is_staff'] is True
        assert 'password' not in data

class TestReviewSerializer:
    def test_nested_sender_serialization(self):
        mock_sender = MagicMock()
        mock_sender.first_name = "Jane"
        mock_sender.last_name = "Doe"
        mock_sender.profile_pic = None

        mock_review = MagicMock()
        mock_review.id = 1
        mock_review.sender = mock_sender
        mock_review.content = "Nagyon jó volt!"
        mock_review.point = 5
        mock_review.created_at = "2023-10-01T12:00:00Z"

        serializer = ReviewSerializer(mock_review)
        data = serializer.data

        assert data['content'] == "Nagyon jó volt!"
        assert data['sender']['first_name'] == "Jane"

class TestAddEditLocationSerializer:
    def test_valid_location(self):
        data = {
            "label": "Otthon",
            "lat": 47.4979,
            "lng": 19.0402,
            "address": "Budapest, Fő utca 1."
        }
        serializer = AddEditLocationSerializer(data=data)
        assert serializer.is_valid() is True

    def test_invalid_coordinates(self):
        data = {
            "label": "Hibás hely",
            "lat": "nem_egy_szám",
            "lng": 19.0402,
            "address": "Budapest"
        }
        serializer = AddEditLocationSerializer(data=data)
        assert serializer.is_valid() is False
        assert "lat" in serializer.errors