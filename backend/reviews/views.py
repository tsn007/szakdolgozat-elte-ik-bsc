from rest_framework import generics
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied, ValidationError

from reviews.models import Review
from reservations.models import Reservation
from reviews.serializers import CreateReviewSerializer

class CreateReview(generics.CreateAPIView):
    serializer_class = CreateReviewSerializer

    def perform_create(self, serializer):
        reservation_id = self.kwargs.get('reservation_id')
        reservation = get_object_or_404(Reservation, id=reservation_id)
        user = self.request.user

        if reservation.status != Reservation.Status.COMPLETED:
            raise ValidationError('Reviews can only be written on completed reservations!')
        
        if user != reservation.renter and user != reservation.item.owner:
            raise PermissionDenied('You are not included in this reservation!')
        
        if Review.objects.filter(reservation=reservation, sender=user.id).exists():
            raise ValidationError('You have already submitted a review for this reservation.')
        
        if reservation.item.owner == reservation.renter:
            raise ValidationError('You can not leave a review for yourself!')
        
        receiver = reservation.item.owner if user == reservation.renter else reservation.renter

        serializer.save(
            reservation=reservation,
            sender=user,
            receiver=receiver,
        )
