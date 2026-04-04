import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
import chat.routing
from chat.middleware import JWTCookieMiddleware

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'community_sharing.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": JWTCookieMiddleware(
        URLRouter(
            chat.routing.websocket_urlpatterns # type: ignore[arg-type]
        )
    ),
})