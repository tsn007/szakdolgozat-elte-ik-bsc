from rest_framework import serializers

from items.models import Item

class AllItemResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ['id', 'category', 'name', 'price', 'owner', 'image']

class PaginatedResponse(serializers.Serializer):
    count = serializers.IntegerField()
    next = serializers.CharField()
    previous = serializers.CharField()
    results = AllItemResponseSerializer(many=True)