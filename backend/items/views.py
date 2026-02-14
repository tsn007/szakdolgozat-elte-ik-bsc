from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework import status
from drf_spectacular.utils import extend_schema

from items.models import Item
from items.serializers import AllItemResponseSerializer

@extend_schema(request=None, responses=AllItemResponseSerializer(many=True))
@api_view(['GET'])
@permission_classes([AllowAny])
def get_all_items(request: Request) -> Response:
    items = Item.objects.all()
    serializer = AllItemResponseSerializer(items, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


