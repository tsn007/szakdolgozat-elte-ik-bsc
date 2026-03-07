from django.urls import path

from items.views import ItemListView

urlpatterns = [
    path('all/', ItemListView.as_view(), name='get_all_items'),
]