from rest_framework.permissions import AllowAny
from rest_framework import generics

from categories.serializers import AllCategoriesResponseSerializer
from categories.models import Category

class CategoriesListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = AllCategoriesResponseSerializer
    queryset = Category.objects.all()