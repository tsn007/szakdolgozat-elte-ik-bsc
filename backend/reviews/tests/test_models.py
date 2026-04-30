import pytest
from django.db import IntegrityError
from django.utils import timezone
from datetime import timedelta

from users.models import User
from reservations.models import Reservation
from reviews.models import Review
from items.models import Item, Location
from categories.models import Category

@pytest.fixture
def test_data():
    sender = User.objects.create_user(
        email="sender@example.com", password="pw", first_name="John", last_name="Doe"
    )
    receiver = User.objects.create_user(
        email="receiver@example.com", password="pw", first_name="Jane", last_name="Smith"
    )
    
    category = Category.objects.create(name="Test Category", slug="test-category")
    
    location = Location.objects.create(
        user=receiver, 
        address="123 Test St", 
        lat=0.0, 
        lng=0.0
    )
    
    item = Item.objects.create(
        name="Test Item",
        price=10.0,
        category=category,
        location=location,
        owner=receiver
    )

    reservation = Reservation.objects.create(
        item=item,
        renter=sender,
        from_date=timezone.now(),
        to_date=timezone.now() + timedelta(days=2),
        total_price=20.0
    )
    
    return {
        "sender": sender, 
        "receiver": receiver, 
        "item": item, 
        "reservation": reservation
    }

@pytest.mark.django_db
class TestReviewSignals:

    def test_update_user_rating_on_save(self, test_data):
        receiver = test_data["receiver"]
        
        assert receiver.rating == 0.0
        assert receiver.rating_count == 0

        Review.objects.create(
            reservation=test_data["reservation"],
            sender=test_data["sender"],
            receiver=receiver,
            point=5.0
        )
        
        receiver.refresh_from_db()
        assert receiver.rating == 5.0
        assert receiver.rating_count == 1

        res_2 = Reservation.objects.create(
            item=test_data["item"],
            renter=test_data["sender"], 
            from_date=timezone.now() + timedelta(days=3),
            to_date=timezone.now() + timedelta(days=4),
            total_price=20.0
        )
        
        Review.objects.create(
            reservation=res_2,
            sender=test_data["sender"],
            receiver=receiver,
            point=3.0
        )

        receiver.refresh_from_db()
        assert receiver.rating == 4.0
        assert receiver.rating_count == 2

    def test_update_user_rating_on_delete(self, test_data):
        receiver = test_data["receiver"]
        
        review = Review.objects.create(
            reservation=test_data["reservation"],
            sender=test_data["sender"],
            receiver=receiver,
            point=4.0
        )
        
        receiver.refresh_from_db()
        assert receiver.rating == 4.0
        assert receiver.rating_count == 1

        review.delete()
        
        receiver.refresh_from_db()
        assert receiver.rating == 0.0
        assert receiver.rating_count == 0

@pytest.mark.django_db
class TestReviewConstraints:

    def test_unique_review_per_reservation(self, test_data):
        Review.objects.create(
            reservation=test_data["reservation"],
            sender=test_data["sender"],
            receiver=test_data["receiver"],
            point=5.0
        )

        with pytest.raises(IntegrityError):
            Review.objects.create(
                reservation=test_data["reservation"],
                sender=test_data["sender"],
                receiver=test_data["receiver"],
                point=1.0
            )