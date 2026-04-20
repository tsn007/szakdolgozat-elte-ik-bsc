import pytest
from django.db import IntegrityError
from django.utils import timezone
from datetime import timedelta

# Adjust imports based on your app structure
from users.models import User
from reservations.models import Reservation
from reviews.models import Review
from items.models import Item, Location
from categories.models import Category

@pytest.fixture
def test_data():
    """
    A Pytest fixture to set up the necessary database objects 
    (Users, Category, Location, Item, and a Reservation) before each test runs.
    """
    sender = User.objects.create_user(
        email="sender@example.com", password="pw", first_name="John", last_name="Doe"
    )
    receiver = User.objects.create_user(
        email="receiver@example.com", password="pw", first_name="Jane", last_name="Smith"
    )
    
    # 1. Create missing dependencies for the Item
    category = Category.objects.create(name="Test Category", slug="test-category")
    
    # ADDED THE USER HERE to fix the Location IntegrityError
    location = Location.objects.create(
        user=receiver, 
        address="123 Test St", 
        lat=0.0, 
        lng=0.0
    )
    
    # 2. Create the Item (Receiver is the owner of the item)
    item = Item.objects.create(
        name="Test Item",
        price=10.0,
        category=category,
        location=location,
        owner=receiver
    )

    # 3. Create the Reservation WITH the item attached
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
        """
        Tests if creating new reviews automatically calculates and updates 
        the receiver's average rating and rating count.
        """
        receiver = test_data["receiver"]
        
        # Ensure initial state is 0
        assert receiver.rating == 0.0
        assert receiver.rating_count == 0

        # 1. Create first review (5.0 points)
        Review.objects.create(
            reservation=test_data["reservation"],
            sender=test_data["sender"],
            receiver=receiver,
            point=5.0
        )
        
        # Refresh the receiver from the database to get the updated fields
        receiver.refresh_from_db()
        assert receiver.rating == 5.0
        assert receiver.rating_count == 1

        # 2. Create a second review (3.0 points) - using a new reservation 
        # Don't forget to attach the item here as well!
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

        # Average of 5.0 and 3.0 should be 4.0, count should be 2
        receiver.refresh_from_db()
        assert receiver.rating == 4.0
        assert receiver.rating_count == 2

    def test_update_user_rating_on_delete(self, test_data):
        """
        Tests if deleting a review triggers the recalculation of the user's rating.
        """
        receiver = test_data["receiver"]
        
        # Create a review
        review = Review.objects.create(
            reservation=test_data["reservation"],
            sender=test_data["sender"],
            receiver=receiver,
            point=4.0
        )
        
        receiver.refresh_from_db()
        assert receiver.rating == 4.0
        assert receiver.rating_count == 1

        # Delete the review
        review.delete()
        
        # The signal should catch the deletion and reset stats to 0
        receiver.refresh_from_db()
        assert receiver.rating == 0.0
        assert receiver.rating_count == 0

@pytest.mark.django_db
class TestReviewConstraints:

    def test_unique_review_per_reservation(self, test_data):
        """
        Tests the Meta UniqueConstraint: A sender can only leave ONE review per reservation.
        """
        # Create the first valid review
        Review.objects.create(
            reservation=test_data["reservation"],
            sender=test_data["sender"],
            receiver=test_data["receiver"],
            point=5.0
        )

        # Attempting to create a second review for the EXACT SAME reservation and sender
        # should raise an IntegrityError at the database level.
        with pytest.raises(IntegrityError):
            Review.objects.create(
                reservation=test_data["reservation"],
                sender=test_data["sender"],
                receiver=test_data["receiver"],
                point=1.0
            )