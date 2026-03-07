from django.urls import path

from categories.views import CategoriesListView

urlpatterns = [
    path('all/', CategoriesListView.as_view(), name="get_all_categories")
]