from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema
from rest_framework.pagination import PageNumberPagination

from items.models import Item
from items.serializers import AllItemResponseSerializer, PaginatedResponse

@extend_schema(request=None, responses=PaginatedResponse)
@api_view(['GET'])
@permission_classes([AllowAny])
def get_all_items(request: Request) -> Response:
    items = Item.objects.select_related('owner', 'location', 'category').prefetch_related('images') #type: ignore
    paginator = PageNumberPagination()
    page = paginator.paginate_queryset(items, request)
    serializer = AllItemResponseSerializer(page, many=True, context={'request': request})
    return paginator.get_paginated_response(serializer.data)


