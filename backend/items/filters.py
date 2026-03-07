import django_filters
from items.models import Item

class CharInFilter(django_filters.BaseInFilter, django_filters.CharFilter):
    pass

class ItemFilter(django_filters.FilterSet):
    category = CharInFilter(field_name='category__name', lookup_expr='in')
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    
    class Meta:
        model = Item
        fields = ['category', 'min_price', 'max_price']