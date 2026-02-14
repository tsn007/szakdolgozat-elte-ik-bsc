from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework import status
from drf_spectacular.utils import extend_schema

from categories.serializers import AllCategoriesResponseSerializer
from categories.models import Category

@extend_schema(request=None, responses=AllCategoriesResponseSerializer(many=True))
@api_view(['GET'])
@permission_classes([AllowAny])
def get_all_categories(request: Request) -> Response:
    categories = Category.objects.all()
    serializer = AllCategoriesResponseSerializer(categories, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
