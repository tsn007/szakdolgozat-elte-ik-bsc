from django.urls import path

from reservations.views import CreateReservation, GetUserReservations, GetReservationRequests, ChangeReservationStatus

urlpatterns = [
    path('create/', CreateReservation.as_view(), name='create_reservation'),
    path('get/', GetUserReservations.as_view(), name='get_user_reservations'),
    path('get/requests/', GetReservationRequests.as_view(), name='get_reservation_requests'),
    path('update/<uuid:id>', ChangeReservationStatus.as_view(), name='update_reservation_status'),
]