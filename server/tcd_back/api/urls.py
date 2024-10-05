from django.urls import path
from .views import get_users, create_user

urlpatterns = [
	path('users/', get_users, name='get_users'),
	path('add_user/', create_user, name='create_user'),
]