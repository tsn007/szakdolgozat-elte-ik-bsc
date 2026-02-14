from rest_framework import serializers

from items.models import Item

class AllItemResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ['id', 'category', 'name', 'price', 'owner']