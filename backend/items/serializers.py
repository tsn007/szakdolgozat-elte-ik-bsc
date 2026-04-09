import time

from rest_framework import serializers
from django.core.files.base import ContentFile
from drf_spectacular.utils import extend_schema_field
from django.utils import timezone

from reviews.models import Review
from reservations.serializers import ItemAvailabiltySerializer
from categories.serializers import ItemCategorySerializer
from users.serializers import ReviewSerializer, UserDataSerializer
from items.models import Item, ItemImage, Location

class ItemImagesSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemImage
        fields = ['id', 'image']

class OwnItemSerializer(serializers.ModelSerializer):
    images = ItemImagesSerializer(many=True)
    class Meta:
        model = Item
        fields = ['id', 'name', 'price', 'created_at', 'cover', 'location', 'category', 'images']

class OwnLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'label', 'address', 'lat', 'lng']

class LimitedLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'address', 'lat', 'lng']

class ItemResponseSerializer(serializers.ModelSerializer):
    owner = UserDataSerializer()
    location = LimitedLocationSerializer()
    images = ItemImagesSerializer(many=True)
    category = ItemCategorySerializer()
    reservations = serializers.SerializerMethodField()
    reviews = serializers.SerializerMethodField()
    class Meta:
        model = Item
        fields = ['id', 'category', 'name', 'price', 'owner', 'cover', 'location', 'images', 'reservations', 'reviews']

    @extend_schema_field(ItemAvailabiltySerializer(many=True))
    def get_reservations(self, obj):
        active_reservations = []
        for res in obj.reservations.all():
            if res.status in ['ACCEPTED', 'IN PROGRESS', 'PENDING'] and res.to_date >= timezone.now():
                active_reservations.append(res)

        return ItemAvailabiltySerializer(active_reservations, many=True).data
    
    @extend_schema_field(ReviewSerializer(many=True))
    def get_reviews(self, obj):
        reviews = Review.objects.filter(reservation__item=obj, receiver=obj.owner)

        return ReviewSerializer(reviews, many=True).data

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
    
class EditItemSerializer(serializers.ModelSerializer):
    images = ItemImagesSerializer(many=True, read_only=True)
    kept_existing_images = serializers.ListField(
        child=serializers.CharField(), write_only=True, required=False
    )
    existing_cover_url = serializers.URLField(write_only=True, required=False)
    class Meta:
        model = Item
        fields = ['category', 'name', 'price', 'cover', 'location', 'images', 'kept_existing_images', 'existing_cover_url']

    def update(self, instance, validated_data):
        request = self.context.get('request')
        
        validated_data.pop('images', None)
        validated_data.pop('kept_existing_images', None)
        validated_data.pop('existing_cover_url', None)
        validated_data.pop('cover', None)

        old_cover_content = None
        old_cover_name = ""
        if instance.cover:
            try:
                old_cover_content = instance.cover.read()
                old_cover_name = instance.cover.name.split('/')[-1]
            except Exception:
                pass

        instance = super().update(instance, validated_data)

        if request and 'kept_existing_images' in request.data:
            kept_ids = request.data.getlist('kept_existing_images')
            instance.images.exclude(id__in=kept_ids).delete()

        new_cover_file = request.FILES.get('cover') #type: ignore
        existing_cover_url = request.data.get('existing_cover_url') #type: ignore

        cover_changed = False

        if new_cover_file:
            cover_changed = True
            instance.cover = new_cover_file

        elif existing_cover_url:
            matching_img = None
            for img in instance.images.all():
                if img.image.url in existing_cover_url:
                    matching_img = img
                    break
            
            if matching_img and (not instance.cover or matching_img.image.url != instance.cover.url):
                cover_changed = True
                file_content = matching_img.image.read()
                file_name = matching_img.image.name.split('/')[-1]
                
                instance.cover.save(file_name, ContentFile(file_content), save=False)
                matching_img.delete()

        if cover_changed and old_cover_content:
            new_gallery_img = ItemImage(item=instance)
            new_gallery_img.image.save(old_cover_name, ContentFile(old_cover_content), save=False)
            new_gallery_img.save()

        if request and 'images' in request.FILES:
            for image_file in request.FILES.getlist('images'):
                ItemImage.objects.create(item=instance, image=image_file)

        instance.save()
        return instance


