from rest_framework import generics
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter
from rest_framework.exceptions import ValidationError as DRFValidationError
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db.models import Q

from reservations.serializers import CreateReservationSerializer, ReservationRequestSerializer, StatusChangeSerializer, UserReservationSerializer
from reservations.models import Reservation

class CreateReservation(generics.CreateAPIView):
    serializer_class = CreateReservationSerializer

    def perform_create(self, serializer):
        item = serializer.validated_data['item']

        if item.owner == self.request.user:
            serializer.save(renter=self.request.user, status='ACCEPTED', total_price=0)
        else:
            from_date = serializer.validated_data["from_date"]
            to_date = serializer.validated_data["to_date"]
            difference = to_date - from_date
            days_to_charge = difference.days if difference.days > 0 else 1
            total = item.price * days_to_charge
            serializer.save(renter=self.request.user, total_price=total)

@extend_schema_view(
    get=extend_schema(
        parameters=[
            OpenApiParameter(name='tab', required=True, type=str),
        ]
    )
)
class GetUserReservations(generics.ListAPIView):
    serializer_class = UserReservationSerializer

    def get_queryset(self):
        qs = Reservation.objects.filter(renter=self.request.user.id)
        tab = self.request.query_params.get('tab', 'in-progress')

        if tab == "in-progress":
            return qs.filter(status__in=[Reservation.Status.PENDING, Reservation.Status.ACCEPTED, Reservation.Status.IN_PROGRESS, Reservation.Status.RETURN_PENDING])
        elif tab == "completed":
            return qs.filter(status__in=[Reservation.Status.COMPLETED, Reservation.Status.REJECTED])
        
        return qs

@extend_schema_view(
    get=extend_schema(
        parameters=[
            OpenApiParameter(name='tab', required=True, type=str),
        ]
    )
)
class GetReservationRequests(generics.ListAPIView):
    serializer_class = ReservationRequestSerializer
    
    def get_queryset(self):
        qs = Reservation.objects.select_related('item').filter(item__owner=self.request.user.id)
        tab = self.request.query_params.get('tab', 'requests')

        if tab == "requests":
            return qs.filter(status__in=[Reservation.Status.PENDING, Reservation.Status.RETURN_PENDING])
        elif tab == "active":
            return qs.filter(status__in=[Reservation.Status.ACCEPTED, Reservation.Status.IN_PROGRESS])
        elif tab == "history":
            return qs.filter(status__in=[Reservation.Status.COMPLETED, Reservation.Status.REJECTED])
        
        return qs

class ChangeReservationStatus(generics.UpdateAPIView):
    serializer_class = StatusChangeSerializer
    lookup_field = 'id'

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Reservation.objects.none()
        
        return Reservation.objects.select_related('item').filter(Q(item__owner=self.request.user.id) | Q(renter=self.request.user.id))
    
    def perform_update(self, serializer):
        reservation = serializer.instance
        new_status = serializer.validated_data.get('status')

        if not new_status:
            raise DRFValidationError({"status": "This field is mandatory!"})
        
        try:
            reservation.change_status(new_status, self.request.user)
        except DjangoValidationError as e:
            raise DRFValidationError({"status": str(e)})
    