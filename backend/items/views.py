from rest_framework.permissions import AllowAny
from rest_framework import generics, filters
from rest_framework.pagination import PageNumberPagination
from django.db.models.functions import ACos, Sin, Cos, Radians
from django.db.models import F, ExpressionWrapper, FloatField
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.parsers import MultiPartParser, FormParser

from items.filters import ItemFilter
from items.models import Item
from items.serializers import CreateItemSerializer, EditItemSerializer, ItemResponseSerializer

class ItemPagination(PageNumberPagination):
    page_size = 30
    page_size_query_param = 'page_size'
    max_page_size = 30

@extend_schema_view(
    get=extend_schema(
        parameters=[
            OpenApiParameter(name='lat', description='User latitude', required=False, type=float),
            OpenApiParameter(name='lng', description='User longitude', required=False, type=float),
        ]
    )
)
class ItemListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ItemResponseSerializer
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = ItemFilter
    search_fields = ['name', 'category__name', 'owner__first_name', 'owner__last_name']

    def get_queryset(self):
        queryset = Item.objects.select_related(
            'owner', 'location', 'category'
        ).prefetch_related('images')

        lat_str = self.request.query_params.get('lat')
        lng_str = self.request.query_params.get('lng')

        if lat_str and lng_str:
            lat = float(lat_str)
            lng = float(lng_str)
            EARTH_RADIUS = 6371.0

            distance_math = EARTH_RADIUS * ACos(
                Sin(Radians(lat)) * Sin(Radians(F('location__lat'))) + 
                Cos(Radians(lat)) * Cos(Radians(F('location__lat'))) * Cos(Radians(F('location__lng')) - Radians(lng))
            )

            queryset = queryset.annotate(
                distance=ExpressionWrapper(
                    distance_math,
                    output_field=FloatField()
                )
            ).order_by('distance')
        else:
            queryset = queryset.order_by('-created_at')

        return queryset

    pagination_class = ItemPagination

class ItemById(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    queryset = Item.objects.select_related('owner', 'location', 'category').prefetch_related('images')
    serializer_class = ItemResponseSerializer
    lookup_field = 'id'

class CreateItem(generics.CreateAPIView):
    queryset = Item.objects.all()
    serializer_class = CreateItemSerializer
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class DeleteItem(generics.DestroyAPIView):
    queryset = Item.objects.all()
    lookup_field = 'id'

class EditItem(generics.UpdateAPIView):
    serializer_class = EditItemSerializer
    parser_classes = [MultiPartParser, FormParser]
    lookup_field = 'id'

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Item.objects.none()
        
        return Item.objects.filter(owner=self.request.user)

    def perform_update(self, serializer):
        return serializer.save(owner=self.request.user)
    