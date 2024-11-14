from django.urls import path
from . import consumers
from .consumers import SocketConsumer

websocket_urlpatterns = [
    path(r'wss/api/', SocketConsumer.as_asgi()),
]
