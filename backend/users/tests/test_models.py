import pytest
from django.contrib.auth import get_user_model

User = get_user_model()

@pytest.mark.django_db
class TestUserManager:

    def test_create_user_success(self):
        email = "normal@example.com"
        password = "securepassword123"
        
        user = User.objects.create_user(
            email=email, 
            password=password, 
            first_name="John", 
            last_name="Doe"
        )
        
        assert user.email == email
        assert user.first_name == "John"
        assert user.is_staff is False
        assert user.is_superuser is False
        
        assert user.password != password
        assert user.check_password(password) is True

    def test_create_user_without_email_raises_error(self):
        with pytest.raises(ValueError) as excinfo:
            User.objects.create_user(email="", password="password123")
            
        assert "Email address is required" in str(excinfo.value)

    def test_create_superuser(self):
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
        user = User.objects.create_user(email="token@example.com", password="password")
        raw_token = "my-secret-refresh-token"
        
        returned_token = user.set_refresh_token(raw_token)
        
        assert returned_token == raw_token
        
        user.refresh_from_db()
        assert user.refresh_token is not None
        assert user.refresh_token != raw_token

    def test_check_refresh_token_validation(self):
        user = User.objects.create_user(email="check@example.com", password="password")
        valid_raw_token = "valid-token-123"
        user.set_refresh_token(valid_raw_token)
        
        assert user.check_refresh_token(valid_raw_token) is True
        
        invalid_raw_token = "completely-wrong-token"
        assert user.check_refresh_token(invalid_raw_token) is False