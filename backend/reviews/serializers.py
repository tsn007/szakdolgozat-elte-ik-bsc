from rest_framework import serializers

from reviews.models import Review

class CreateReviewSerializer(serializers.ModelSerializer):
    point = serializers.FloatField(required=True)
    class Meta:
        model = Review
        fields = ['content', 'point']