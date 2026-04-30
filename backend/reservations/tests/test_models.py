import pytest
from unittest.mock import patch
from django.utils import timezone
from datetime import timedelta
from rest_framework.exceptions import ValidationError

from users.models import User
from items.models import Item, Location
from categories.models import Category
from reservations.models import Reservation

@pytest.fixture
def reservation_data():
    owner = User.objects.create_user(
        email="owner@example.com", password="pw", first_name="Owner", last_name="User"
    )
    renter = User.objects.create_user(
        email="renter@example.com", password="pw", first_name="Renter", last_name="User"
    )
    
    category = Category.objects.create(name="Tools", slug="tools")
    location = Location.objects.create(user=owner, address="123 St", lat=0.0, lng=0.0)
    
    item = Item.objects.create(
        name="Drill", price=10.0, category=category, location=location, owner=owner
    )

    reservation = Reservation.objects.create(
        item=item,
        renter=renter,
        from_date=timezone.now(),
        to_date=timezone.now() + timedelta(days=2),
        total_price=20.0,
        status=Reservation.Status.PENDING
    )
    
    return {"owner": owner, "renter": renter, "reservation": reservation}

@pytest.mark.django_db
class TestReservationStateMachine:

    @patch('chat.models.Conversation.objects.get_or_create')
    def test_successful_transition_by_owner_creates_conversation(self, mock_get_or_create, reservation_data):
        reservation = reservation_data["reservation"]
        owner = reservation_data["owner"]

        reservation.change_status(Reservation.Status.ACCEPTED, user=owner)

        assert reservation.status == Reservation.Status.ACCEPTED
        mock_get_or_create.assert_called_once_with(reservation=reservation)

    def test_successful_transition_by_renter(self, reservation_data):
        reservation = reservation_data["reservation"]
        renter = reservation_data["renter"]
        
        reservation.status = Reservation.Status.ACCEPTED
        reservation.save()

        reservation.change_status(Reservation.Status.IN_PROGRESS, user=renter)

        assert reservation.status == Reservation.Status.IN_PROGRESS

    def test_illegal_state_transition_raises_error(self, reservation_data):
        reservation = reservation_data["reservation"]
        owner = reservation_data["owner"]

        with pytest.raises(ValidationError) as excinfo:
            reservation.change_status(Reservation.Status.COMPLETED, user=owner)
            
        assert "Illegal state transition" in str(excinfo.value)

    def test_unauthorized_user_transition_raises_error(self, reservation_data):
        reservation = reservation_data["reservation"]
        renter = reservation_data["renter"]

        with pytest.raises(ValidationError) as excinfo:
            reservation.change_status(Reservation.Status.ACCEPTED, user=renter)
            
        assert "Only the item owner can certify this state" in str(excinfo.value)

    def test_owner_cannot_start_in_progress(self, reservation_data):
        reservation = reservation_data["reservation"]
        owner = reservation_data["owner"]

        reservation.status = Reservation.Status.ACCEPTED
        reservation.save()

        with pytest.raises(ValidationError) as excinfo:
            reservation.change_status(Reservation.Status.IN_PROGRESS, user=owner)
            
        assert "Only the renter can certify this state" in str(excinfo.value)

    def test_idempotent_status_change(self, reservation_data):
        reservation = reservation_data["reservation"]
        owner = reservation_data["owner"]

        reservation.change_status(Reservation.Status.PENDING, user=owner)
        
        assert reservation.status == Reservation.Status.PENDING