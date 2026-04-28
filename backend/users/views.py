from tokenize import TokenError
from typing import cast
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from django.utils.timezone import now
from rest_framework_simplejwt.tokens import RefreshToken, Token
from drf_spectacular.utils import extend_schema
from rest_framework import generics
from django.db.models.deletion import ProtectedError
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.pagination import PageNumberPagination

from users.permissions import IsStaff
from reviews.models import Review
from items.models import Item, Location
from items.serializers import OwnItemSerializer, OwnLocationSerializer
from users.models import User
from users.serializers import AddEditLocationSerializer, StaffUsersSerializer, LoginSerializer, ProfilePictureUpdateSerializer, RegisterSerializer, ReviewSerializer, SetIsActiveSerializer, SuccessResponseSerializer, UserDataEditSerializer, UserResponseSerializer

@extend_schema(request=LoginSerializer, responses=UserResponseSerializer)
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request: Request) -> Response:
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    data = serializer.validated_data
    email = data['email']
    password = data['password']

    user = authenticate(request, email=email, password=password)

    if user is None:
        try:
            db_user = User.objects.get(email=email)
            
            if db_user.check_password(password) and not db_user.is_active:
                return Response(
                    {'error': 'This account has been suspended!'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
                
        except User.DoesNotExist:
            pass

        return Response(
            {'error': 'Invalid email or password!'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    user.last_login = now()
    user.save(update_fields=['last_login'])

    refresh = RefreshToken.for_user(user)
    access = refresh.access_token

    custom_user = cast(User, user)
    custom_user.set_refresh_token(str(refresh))

    serializer_resp = UserResponseSerializer(instance={'user': user})

    response = Response(serializer_resp.data, status=status.HTTP_200_OK)

    response.set_cookie(
        key='accessToken',
        value=str(access),
        httponly=True,
        secure=False,
        samesite="Lax",
        max_age=60*60,
    )

    response.set_cookie(
        key='refreshToken',
        value=str(refresh),
        httponly=True,
        secure=False,
        samesite="Lax",
        max_age=24*60*60,
    )

    return response

@extend_schema(request=None, responses=UserResponseSerializer)
@api_view(['GET'])
def me(request: Request) -> Response:
    user = cast(User, request.user)
    serializer = UserResponseSerializer(instance={'user': user})
    return Response(serializer.data, status=status.HTTP_200_OK)

@extend_schema(request=None, responses=UserResponseSerializer)
@api_view(['GET'])
@permission_classes([AllowAny])
def refresh(request: Request) -> Response:
    refresh_token = request.COOKIES.get('refreshToken')
    if not refresh_token:
        return Response('Refresh token missing', status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        refresh = RefreshToken(cast(Token, refresh_token))
        try:
            user_id = cast(str, refresh.payload.get('user_id'))
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response('User not found', status=status.HTTP_401_UNAUTHORIZED)

        if not user.check_refresh_token(refresh_token):
            return Response('Invalid refresh token', status=status.HTTP_401_UNAUTHORIZED)
        
        new_refresh = RefreshToken.for_user(user)
        new_access = new_refresh.access_token
        user.set_refresh_token(str(new_refresh))

        serializer = UserResponseSerializer(instance={'user': user})
        response = Response(serializer.data, status=status.HTTP_200_OK)

        response.set_cookie(
            key='accessToken',
            value=str(new_access),
            httponly=True,
            secure=False,
            samesite="Lax",
            max_age=60*60,
        )

        response.set_cookie(
            key='refreshToken',
            value=str(new_refresh),
            httponly=True,
            secure=False,
            samesite="Lax",
            max_age=24*60*60,
        )

        return response
    
    except TokenError:
        return Response('Invalid or expired refresh token', status=status.HTTP_401_UNAUTHORIZED)

@extend_schema(request=None, responses=SuccessResponseSerializer)
@api_view(['POST'])
def logout(request: Request) -> Response:
    response = Response({'message': 'Logged out succesfully!'}, status=status.HTTP_200_OK)

    response.delete_cookie('accessToken')
    response.delete_cookie('refreshToken')

    if request.user.is_authenticated:
        user = cast(User, request.user)
        user.refresh_token = None
        user.save(update_fields=['refresh_token'])

    return response

@extend_schema(request=RegisterSerializer, responses=SuccessResponseSerializer)
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request: Request) -> Response:
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response({'message': 'Registration successful!'}, status=status.HTTP_201_CREATED)

class UserItemList(generics.ListAPIView):
    serializer_class = OwnItemSerializer

    def get_queryset(self):   
        queryset = Item.objects.filter(owner=self.request.user.id)
        return queryset

class UserReviewsList(generics.ListAPIView):
    serializer_class = ReviewSerializer

    def get_queryset(self):
        queryset = Review.objects.filter(receiver=self.request.user.id)
        return queryset

class UserLocationList(generics.ListAPIView):
    serializer_class = OwnLocationSerializer

    def get_queryset(self):   
        queryset = Location.objects.filter(user=self.request.user.id)
        return queryset

class UserDataEdit(generics.UpdateAPIView):
    serializer_class = UserDataEditSerializer

    def get_object(self):
        return self.request.user

class AddLocation(generics.CreateAPIView):
    serializer_class = AddEditLocationSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class DeleteLocation(generics.DestroyAPIView):
    queryset = Location.objects.all()
    lookup_field = 'id'

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            self.perform_destroy(instance)
        except ProtectedError:
            return Response({"detail": "This location cannot be deleted because it is currently assigned to an item."}, status=status.HTTP_423_LOCKED)
        return Response(status=204)
    
class UpdateProfilePicture(generics.UpdateAPIView):
    serializer_class = ProfilePictureUpdateSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        return self.request.user
    
class EditLocation(generics.UpdateAPIView):
    queryset = Location.objects.all()
    serializer_class = AddEditLocationSerializer
    lookup_field = 'id'

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Location.objects.none()
        
        return Location.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        return serializer.save(user=self.request.user)

class SetIsActiveStatus(generics.UpdateAPIView):
    permission_classes = [IsStaff]
    serializer_class = SetIsActiveSerializer
    queryset = User.objects.all()
    lookup_field = 'id'

class UserPagination(PageNumberPagination):
    page_size = 50

class UsersList(generics.ListAPIView):
    serializer_class = StaffUsersSerializer
    queryset = User.objects.filter(is_staff=False).order_by('is_active')
    pagination_class = UserPagination
