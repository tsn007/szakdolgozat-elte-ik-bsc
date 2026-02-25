from django.db import models
import uuid
from categories.models import Category
from users.models import User

class Location(models.Model):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='locations')
    label = models.CharField(null=True, blank=True, max_length=50)
    address = models.CharField(max_length=255)
    lat = models.DecimalField(max_digits=10, decimal_places=8)
    lng = models.DecimalField(max_digits=11, decimal_places=8)

class Item(models.Model):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='items_category')
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='items')
    created_at = models.DateTimeField(auto_now_add=True)
    cover = models.ImageField(upload_to='items/covers/')
    location = models.ForeignKey(Location, on_delete=models.PROTECT, related_name='items_location')

class ItemImage(models.Model):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='items/gallery/')