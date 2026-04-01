from rest_framework import generics
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied, ValidationError

from reservations.models import Reservation
from reviews.serializers import CreateReviewSerializer
from reviews.models import Review

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
        
        receiver = reservation.item.owner if user == reservation.renter else reservation.renter

        serializer.save(
            reservation=reservation,
            sender=user,
            receiver=receiver,
        )
