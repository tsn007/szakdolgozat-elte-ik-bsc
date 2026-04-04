from django.db import models
import uuid
from rest_framework.exceptions import ValidationError
from users.models import User
from items.models import Item

class Reservation(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        ACCEPTED = 'ACCEPTED', 'Accepted'
        REJECTED = 'REJECTED', 'Rejected'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        RETURN_PENDING = 'RETURN_PENDING', 'Return Pending'
        COMPLETED = 'COMPLETED', 'Completed'

    id = models.UUIDField(unique=True, default=uuid.uuid4, primary_key=True, editable=False)
    item = models.ForeignKey(Item, on_delete=models.PROTECT, related_name='reservations')
    from_date = models.DateTimeField()
    to_date = models.DateTimeField()
    renter = models.ForeignKey(User, on_delete=models.PROTECT, related_name="bookings")
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.PENDING)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)

    ALLOWED_TRANSITIONS = {
        Status.PENDING: [Status.ACCEPTED, Status.REJECTED],
        Status.ACCEPTED: [Status.IN_PROGRESS],
        Status.IN_PROGRESS: [Status.RETURN_PENDING],
        Status.RETURN_PENDING: [Status.COMPLETED], 
        Status.REJECTED: [],
        Status.COMPLETED: [],
    }

    def change_status(self, new_status, user):
        if self.status == new_status:
            return
        
        try:
            current_status_enum = self.Status(self.status)
        except ValueError:
            raise ValidationError(f"Unknown state: '{self.status}'")
        
        allowed_next_states = self.ALLOWED_TRANSITIONS.get(current_status_enum, [])

        if new_status not in allowed_next_states:
            raise ValidationError("Illegal state transition!")
        
        if new_status in [self.Status.IN_PROGRESS, self.Status.RETURN_PENDING] and user != self.renter:
            raise ValidationError("Only the renter can certify this state!")
        
        if new_status in [self.Status.ACCEPTED, self.Status.REJECTED, self.Status.COMPLETED] and user != self.item.owner:
            raise ValidationError("Only the item owner can certify this state!")
        
        if new_status == self.Status.ACCEPTED:
            from chat.models import Conversation

            Conversation.objects.get_or_create(reservation=self)
        
        self.status = new_status
        self.save(update_fields=['status'])