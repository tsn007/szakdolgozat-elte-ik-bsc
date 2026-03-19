from django.urls import path
from .views import UserLocationList, login, logout, me, refresh, register, UserItemList, UserDataEdit, AddLocation

urlpatterns = [
    path('login/', login, name='login'),
    path('me/', me, name='me'),
    path('refresh/', refresh, name='refresh'),
    path('logout/', logout, name='logout'),
    path('register/', register, name='register'),
    path('items/', UserItemList.as_view(), name='get-user-items'),
    path('locations/', UserLocationList.as_view(), name='get-user-locations'),
    path('update_profile/', UserDataEdit.as_view(), name='update_user_data'),
    path('add_location/', AddLocation.as_view(), name='add_user_location'),
]