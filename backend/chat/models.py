import uuid
from django.db import models
from django.dispatch import receiver
from django.db.models.signals import post_save
from django.utils import timezone

from users.models import User
from reservations.models import Reservation

class Conversation(models.Model):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
    reservation = models.OneToOneField(Reservation, on_delete=models.CASCADE, related_name='conversation')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Message(models.Model):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='messages')
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

@receiver(post_save, sender=Message)
def update_conversation(sender, instance, created, **kwargs):
    if created:
        Conversation.objects.filter(id=instance.conversation_id).update(updated_at=timezone.now())

