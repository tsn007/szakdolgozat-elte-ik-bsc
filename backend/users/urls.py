from django.urls import path
from .views import login, logout, me, refresh

urlpatterns = [
    path('login/', login, name='login'),
    path('me/', me, name='me'),
    path('refresh/', refresh, name='refresh'),
    path('logout/', logout, name='logout')
]