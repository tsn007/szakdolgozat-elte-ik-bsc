from rest_framework import serializers

from categories.serializers import ItemCategorySerializer
from users.serializers import UserDataSerializer
from items.models import Item, ItemImage, Location

class OwnLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'label', 'address', 'lat', 'lng']

class LimitedLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'address', 'lat', 'lng']  

class AllItemImagesSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemImage
        fields = ['id', 'image']

class AllItemResponseSerializer(serializers.ModelSerializer):
    owner = UserDataSerializer()
    location = LimitedLocationSerializer()
    images = AllItemImagesSerializer(many=True)
    category = ItemCategorySerializer()
    class Meta:
        model = Item
        fields = ['id', 'category', 'name', 'price', 'owner', 'cover', 'location', 'images']

class PaginatedResponse(serializers.Serializer):
    count = serializers.IntegerField()
    next = serializers.CharField()
    previous = serializers.CharField()
    results = AllItemResponseSerializer(many=True)