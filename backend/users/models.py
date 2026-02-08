from typing import Any
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils.crypto import salted_hmac
import uuid
from typing import cast

class UserManager(BaseUserManager):
    def create_user(self, email: str, password: str | None = None, **extra_fields: Any) -> 'User':
        if not email:
            raise ValueError("Email address is required!")
        email = self.normalize_email(email)
        user = cast(User, self.model(email=email, **extra_fields))
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email: str, password: str | None = None, **extra_fields: Any) -> 'User':
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, unique=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    refresh_token = models.CharField(max_length=64, unique=True, blank=True, null=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS= ['first_name', 'last_name']

    def set_refresh_token(self, token: str) -> str:
        hashed = salted_hmac('refresh_token', token).hexdigest()
        self.refresh_token = hashed
        self.save(update_fields=['refresh_token'])
        return token
    
    def check_refresh_token(self, raw_token: str) -> bool:
        hashed = salted_hmac('refresh_token', raw_token).hexdigest()
        return hashed == self.refresh_token
    
    
