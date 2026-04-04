# chat/middleware.py
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

User = get_user_model()

@database_sync_to_async
def get_user_from_jwt_cookie(token_string):
    try:
        access_token = AccessToken(token_string)
        user_id = access_token['user_id']
        return User.objects.get(id=user_id)
    except (InvalidToken, TokenError, User.DoesNotExist):
        return AnonymousUser()

class JWTCookieMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        cookies = scope.get('cookies', {})
        token = cookies.get('access_token')

        if token:
            scope["user"] = await get_user_from_jwt_cookie(token)
        else:
            scope["user"] = AnonymousUser()

        return await super().__call__(scope, receive, send)