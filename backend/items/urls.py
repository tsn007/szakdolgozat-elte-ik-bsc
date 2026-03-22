from django.urls import path

from items.views import ItemListView, ItemById, CreateItem, DeleteItem, EditItem

urlpatterns = [
    path('all/', ItemListView.as_view(), name='get_all_items'),
    path('<uuid:id>', ItemById.as_view(), name='get_item_by_id'),
    path('create/', CreateItem.as_view(), name='create_item'),
    path('delete/<uuid:id>/', DeleteItem.as_view(), name='delete_item'),
    path('edit/<uuid:id>/', EditItem.as_view(), name='edit_item'),
]