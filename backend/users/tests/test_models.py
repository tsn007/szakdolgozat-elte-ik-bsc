import pytest
from django.contrib.auth import get_user_model

# We fetch the user model dynamically (best practice in Django)
User = get_user_model()

@pytest.mark.django_db
class TestUserManager:

    def test_create_user_success(self):
        """Happy path: successfully creates a standard user."""
        email = "normal@example.com"
        password = "securepassword123"
        
        user = User.objects.create_user(
            email=email, 
            password=password, 
            first_name="John", 
            last_name="Doe"
        )
        
        # Verify database fields
        assert user.email == email
        assert user.first_name == "John"
        assert user.is_staff is False
        assert user.is_superuser is False
        
        # Verify password is hashed, not stored in plain text
        assert user.password != password
        assert user.check_password(password) is True

    def test_create_user_without_email_raises_error(self):
        """Edge case: attempting to create a user without an email should raise a ValueError."""
        with pytest.raises(ValueError) as excinfo:
            User.objects.create_user(email="", password="password123")
            
        assert "Email address is required" in str(excinfo.value)

    def test_create_superuser(self):
        """Verifies that the superuser manager method correctly assigns staff and superuser flags."""
        email = "admin@example.com"
        password = "adminpassword"
        
        superuser = User.objects.create_superuser(
            email=email, 
            password=password, 
            first_name="Admin", 
            last_name="User"
        )
        
        assert superuser.is_staff is True
        assert superuser.is_superuser is True


@pytest.mark.django_db
class TestUserModel:

    def test_set_refresh_token_hashes_and_saves(self):
        """
        Tests the custom token method. Verifies that the raw token is returned, 
        but a hashed version is saved to the database.
        """
        user = User.objects.create_user(email="token@example.com", password="password")
        raw_token = "my-secret-refresh-token"
        
        # Call the custom method
        returned_token = user.set_refresh_token(raw_token)
        
        # 1. The method should return the raw token (so it can be sent to the client)
        assert returned_token == raw_token
        
        # 2. The database should contain a hashed version, NOT the raw token
        user.refresh_from_db()
        assert user.refresh_token is not None
        assert user.refresh_token != raw_token

    def test_check_refresh_token_validation(self):
        """
        Tests the HMAC validation logic. It should return True for the 
        correct raw token, and False for an incorrect one.
        """
        user = User.objects.create_user(email="check@example.com", password="password")
        valid_raw_token = "valid-token-123"
        user.set_refresh_token(valid_raw_token)
        
        # Test with the correct token
        assert user.check_refresh_token(valid_raw_token) is True
        
        # Test with an invalid token
        invalid_raw_token = "completely-wrong-token"
        assert user.check_refresh_token(invalid_raw_token) is False