from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import user_views, match_views

urlpatterns = [
	path('users/', user_views.get_users, name='get_users'),
	path('create_user/', user_views.create_user, name='create_user'),
	path('login_user/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
	path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
	path('update_user/', user_views.update_user, name='update_user'),
	# path('delete_user/', user_views.delete_user, name='delete_user'),
	path('users/<int:pk>/', user_views.get_user, name='get_user'),
	path('search_user/<str:name>/', user_views.search_user, name='search_user'),
	path('add_friend/<int:pk>/<int:new_friend>/', user_views.add_friend, name='add_friend'),
	path('remove_friend/<int:pk>/<int:friend>/', user_views.remove_friend, name='remove_friend'),
	path('block_friend/<int:pk>/<int:friend>/', user_views.block_friend, name='block_friend'),
	path('update_pong_ball/<int:pk>/<int:pong_ball>', user_views.update_pong_ball, name='update_pong_ball'),
	path('update_pong_slider/<int:pk>/<int:pong_slider>', user_views.update_pong_slider, name='update_pong_slider'),
	path('update_tic_tac_toe_sign/<int:pk>/<int:tic_tac_toe_sign>', user_views.update_tic_tac_toe_sign, name='update_tic_tac_toe_sign'),
	path('update_tic_tac_toe_background/<int:pk>/<int:tic_tac_toe_background>', user_views.update_tic_tac_toe_background, name='update_tic_tac_toe_background'),
	path('get_user_wins/<int:pk>/', user_views.get_user_wins, name='get_user_wins'),
	path('get_user_losses/<int:pk>/', user_views.get_user_losses, name='get_user_losses'),

	path('matches/', match_views.get_matches, name='get_matches'),
	path('create_match/', match_views.create_match, name='create_match'),
	path('update_match/', match_views.update_match, name='update_match'),
	path('delete_match/', match_views.delete_match, name='delete_match'),
	path('matches/<int:pk>/', match_views.get_match, name='get_match'),
	path('matches/player/<int:player_id>/', match_views.get_match_by_player, name='get_match_by_player')
]