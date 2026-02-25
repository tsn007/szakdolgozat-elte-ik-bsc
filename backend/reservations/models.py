from django.db import models
import uuid
from enum import Enum
from users.models import User
from items.models import Item

class Reservation(models.Model):
    class Status(models.TextChoices):
        OPEN = 'OPEN', 'Open'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        RETURNED = 'RETURNED', 'Returned'
        PAID = 'PAID', 'Paid'
        CLOSED = 'CLOSED', 'Closed'

    id = models.UUIDField(unique=True, default=uuid.uuid4, primary_key=True, editable=False)
    item = models.ForeignKey(Item, on_delete=models.PROTECT, related_name='reservations')
    from_date = models.DateTimeField()
    to_date = models.DateTimeField()
    renter = models.ForeignKey(User, on_delete=models.PROTECT, related_name="bookings")
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.OPEN)