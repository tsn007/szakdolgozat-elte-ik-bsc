import uuid

from django.db import models

from reservations.models import Reservation

class Review(models.Model):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    reservation = models.ForeignKey(Reservation, on_delete=models.CASCADE, related_name='reviews')
    content = models.TextField(null=True, blank=True)
    point = models.FloatField()
