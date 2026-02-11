from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.request import Request
from typing import Optional, Tuple, Any
from rest_framework_simplejwt.tokens import Token

class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request: Request) -> Optional[Tuple[Any, Token]]:
        cookies = request.COOKIES
        access_token = cookies.get('accessToken')
        if access_token:
            try:
                validated_token = self.get_validated_token(access_token.encode())
                return self.get_user(validated_token), validated_token
            except Exception:
                return None       
        return None
