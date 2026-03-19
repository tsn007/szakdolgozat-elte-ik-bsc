from rest_framework import serializers

from categories.serializers import ItemCategorySerializer
from users.serializers import UserDataSerializer
from items.models import Item, ItemImage, Location

class OwnItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ['id', 'name', 'price', 'created_at', 'cover']

class OwnLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'label', 'address', 'lat', 'lng']

class LimitedLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'address', 'lat', 'lng']  

class ItemImagesSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemImage
        fields = ['id', 'image']

class ItemResponseSerializer(serializers.ModelSerializer):
    owner = UserDataSerializer()
    location = LimitedLocationSerializer()
    images = ItemImagesSerializer(many=True)
    category = ItemCategorySerializer()
    class Meta:
        model = Item
        fields = ['id', 'category', 'name', 'price', 'owner', 'cover', 'location', 'images']

class PaginatedResponse(serializers.Serializer):
    count = serializers.IntegerField()
    next = serializers.CharField()
    previous = serializers.CharField()
    results = ItemResponseSerializer(many=True)

class CreateItemSerializer(serializers.ModelSerializer):
    images = ItemImagesSerializer(many=True, read_only=True)
    class Meta:
        model = Item
        fields = ['id', 'category', 'name', 'price', 'cover', 'images', 'location']
        read_only_fields = ['id']

    def create(self, validated_data):
        item = Item.objects.create(**validated_data)
        request = self.context.get('request')

        if request:
            images_data = request.FILES.getlist('images')
            for image_data in images_data:
                ItemImage.objects.create(item=item, image=image_data)

        return item