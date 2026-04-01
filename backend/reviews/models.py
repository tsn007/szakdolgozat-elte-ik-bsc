import uuid
from django.db.models.signals import post_save, post_delete
from django.db import models
from django.dispatch import receiver
from django.db.models import Avg

from users.models import User
from reservations.models import Reservation

class Review(models.Model):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    reservation = models.ForeignKey(Reservation, on_delete=models.CASCADE, related_name='reviews')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_sent')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_received')
    content = models.TextField(null=True, blank=True)
    point = models.DecimalField(default=0.0, max_digits=2, decimal_places=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['reservation', 'sender'], name='unique_review_per_reservation')
        ]

@receiver(post_save, sender=Review)
@receiver(post_delete, sender=Review)
def update_user_rating(sender, instance, **kwargs):
    user = instance.receiver

    stats = Review.objects.filter(receiver=user).aggregate(
        average=Avg('point'),
        count=models.Count('id')
    )

    user.rating = round(stats['average'] or 0.0, 1)
    user.rating_count = stats['count']

    user.save(update_fields=['rating', 'rating_count'])
