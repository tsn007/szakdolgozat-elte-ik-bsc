from django.db import models
import uuid
from users.models import User
from items.models import Item

class Reservation(models.Model):
    id = models.UUIDField(unique=True, default=uuid.uuid4, primary_key=True, editable=False)
    item = models.ForeignKey(Item, on_delete=models.PROTECT, related_name='reservations')
    from_date = models.DateTimeField()
    to_date = models.DateTimeField()
    renter = models.ForeignKey(User, on_delete=models.PROTECT, related_name="bookings")
    created_at = models.DateTimeField(auto_now_add=True)