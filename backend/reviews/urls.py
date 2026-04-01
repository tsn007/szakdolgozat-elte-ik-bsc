from django.urls import path

from reviews.views import CreateReview

urlpatterns = [
   path('<uuid:reservation_id>/create/', CreateReview.as_view(), name='create_review')
]