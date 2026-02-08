from tokenize import TokenError
from typing import cast
from weakref import ref
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from django.utils.timezone import now
from rest_framework_simplejwt.tokens import RefreshToken, Token

from users.models import User
from users.serializers import LoginSerializer, UserResponseSerializer

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
        return Response({'error': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)
    
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
        secure=True,
        samesite="Lax",
        max_age=60*60,
    )

    response.set_cookie(
        key='refreshToken',
        value=str(refresh),
        httponly=True,
        secure=True,
        samesite="Lax",
        max_age=24*60*60,
    )

    return response

@api_view(['GET'])
def me(request: Request) -> Response:
    user = cast(User, request.user)
    serializer = UserResponseSerializer(instance={'user': user})
    return Response(serializer.data, status=status.HTTP_200_OK)

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
            secure=True,
            samesite="Lax",
            max_age=60*60,
        )

        response.set_cookie(
            key='refreshToken',
            value=str(new_refresh),
            httponly=True,
            secure=True,
            samesite="Lax",
            max_age=24*60*60,
        )

        return response
    
    except TokenError:
        return Response('Invalid or expired refresh token', status=status.HTTP_401_UNAUTHORIZED)
    
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
