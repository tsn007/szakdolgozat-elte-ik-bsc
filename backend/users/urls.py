from django.urls import path
from .views import UserLocationList, login, logout, me, refresh, register, UserItemList, UserDataEdit, AddLocation, DeleteLocation, UpdateProfilePicture, EditLocation, UserReviewsList, SetIsActiveStatus, UsersList

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
    path('delete_location/<uuid:id>/', DeleteLocation.as_view(), name='delete_user_location'),
    path('update_profilepic/', UpdateProfilePicture.as_view(), name='update_user_profile_pic'),
    path('edit_location/<uuid:id>/', EditLocation.as_view(), name='edit_user_location'),
    path('reviews/', UserReviewsList.as_view(), name='get_user_reviews'),
    path('<uuid:id>/suspend/', SetIsActiveStatus.as_view(), name='suspend_user'),
    path('all/', UsersList.as_view(), name='get_all_non_staff_user')
]