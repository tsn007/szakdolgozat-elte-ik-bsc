from django.db import models
import uuid
from categories.models import Category
from users.models import User

class Item(models.Model):
    id = models.UUIDField(unique=True, default=uuid.uuid4, primary_key=True, editable=False)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='items_category')
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='items')
    latitude = models.DecimalField(max_digits=10, decimal_places=8)
    longitude = models.DecimalField(max_digits=10, decimal_places=8)
    created_at = models.DateTimeField(auto_now_add=True)