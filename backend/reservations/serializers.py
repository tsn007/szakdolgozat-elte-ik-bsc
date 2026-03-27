from rest_framework import serializers

from users.models import User
from items.models import Item, Location
from reservations.models import Reservation

class CreateReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = ['id', 'item', 'from_date', 'to_date', 'renter']
        read_only_fields = ['id', 'renter']

    def validate(self, attrs):
        item = attrs.get('item')
        from_date = attrs.get('from_date')
        to_date = attrs.get('to_date')

        if from_date > to_date:
            raise serializers.ValidationError({
                "form_date": "The start date can not be later than the end date."
            })
        
        overlapping_reservations = Reservation.objects.filter(
            item = item,
            status__in = ["ACCEPTED", "PENDING", "IN PROGRESS"],
            from_date__lte = to_date,
            to_date__gte = from_date
        )

        if overlapping_reservations.exists():
            raise serializers.ValidationError("This item is already booked for the selected dates")
        
        return attrs

class ItemAvailabiltySerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = ['from_date', 'to_date']

class ReservationLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ["id", "address"]

class ReservationUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'profile_pic']

class ReservationItemSerializer(serializers.ModelSerializer):
    location = ReservationLocationSerializer()
    owner = ReservationUserSerializer()
    class Meta:
        model = Item
        fields = ["id", "name", "owner", 'cover', 'location']

class RequestItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ['id', 'name', 'cover']

class InboxItemSerializer(serializers.ModelSerializer):
    location = ReservationLocationSerializer()
    class Meta:
        model = Item
        fields = ['id', 'name', 'cover', 'location']

class UserReservationSerializer(serializers.ModelSerializer):
    item = ReservationItemSerializer()
    class Meta:
        model = Reservation
        fields = ["id", "item", "from_date", "to_date", "created_at", "status", 'total_price']

class ReservationRequestSerializer(serializers.ModelSerializer):
    item = InboxItemSerializer()
    renter = ReservationUserSerializer()
    class Meta:
        model = Reservation
        fields = ['id', 'item', 'from_date', 'to_date', 'renter', 'created_at', 'status', 'total_price']

class StatusChangeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = ['id', 'status']
        read_only_fields = ['id']