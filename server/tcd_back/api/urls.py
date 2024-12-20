from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import user_views, match_views, tf_views, tournament_views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [

	# User urls
	path('users/', user_views.get_users, name='get_users'),
	path('user_info/', user_views.get_user_info, name='get_user_info'),
	path('create_user/', user_views.create_user, name='create_user'),
	path('login_user/', user_views.login_user, name='login_user'),
	path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
	path('update_user/', user_views.update_user, name='update_user'),
	path('delete_account/', user_views.delete_account, name='delete_account'),
	path('anonymize_user/', user_views.anonymize_user, name='anonymize_user'),
	path('get_user/<str:username>/', user_views.get_username, name='get_username'),
	path('users/<int:pk>/', user_views.get_user, name='get_user'),
	path('search_user/<str:username>/', user_views.search_user, name='search_user'),
	path('send_friend_request/<str:friend_username>/', user_views.send_friend_request, name='send_friend_request'),
	path('get_friend_invitations_sent/', user_views.get_friend_invitations_sent, name='get_friend_invitations_sent'),
	path('get_friend_invitations_received/', user_views.get_friend_invitations_received, name='get_friend_invitations_received'),
	path('refuse_friend_request/<int:friend>/', user_views.refuse_friend_request, name='refuse_friend_request'),
	path('add_friend/<int:new_friend>/', user_views.add_friend, name='add_friend'),
	path('remove_friend/<int:friend>/', user_views.remove_friend, name='remove_friend'),
	path('block_friend/<int:friend>/', user_views.block_friend, name='block_friend'),
	path('update_pong_ball/<int:pong_ball>', user_views.update_pong_ball, name='update_pong_ball'),
	path('update_pong_slider/<int:pong_slider>', user_views.update_pong_slider, name='update_pong_slider'),
	path('update_tic_tac_toe_sign/<int:tic_tac_toe_sign>', user_views.update_tic_tac_toe_sign, name='update_tic_tac_toe_sign'),
	path('update_tic_tac_toe_background/<int:tic_tac_toe_background>', user_views.update_tic_tac_toe_background, name='update_tic_tac_toe_background'),
	path('get_friends/', user_views.get_friends, name='get_friends'),
	path('get_blocked_friends/', user_views.get_blocked_friends, name='get_blocked_friends'),
	# path('get_user_wins/<int:pk>/', user_views.get_user_wins, name='get_user_wins'),
	# path('get_user_losses/<int:pk>/', user_views.get_user_losses, name='get_user_losses'),

	# 2FA urls
	path('setup_2fa/', tf_views.setup_2fa, name='setup_2fa'),
	path('verify_2fa/', tf_views.verify_2fa, name='verify_2fa'),

	# Match urls
	path('all_matches/', match_views.get_matches, name='get_matches'),
	path('create_match/', match_views.create_match, name='create_match'),
	path('update_match/', match_views.update_match, name='update_match'),
	path('matches/<int:pk>/', match_views.get_match, name='get_match'),
	path('matches', match_views.get_matches_by_player, name='get_matches_by_player'),
	# # Tournament urls
	path('get_tournaments/', tournament_views.get_tournaments, name='get_tournaments'),
	path('create_tournament/', tournament_views.create_tournament, name='create_tournament'),
	path('update_tournament/', tournament_views.update_tournament, name='update_tournament'),
	path('get_tournament/<int:pk>/', tournament_views.get_tournament, name='get_tournament'),
    path('get_tournament_from_match/<int:pk>/', tournament_views.get_tournament_from_match, name='get_tournament_from_match'),
	path('get_tournaments_by_player', tournament_views.get_tournaments_by_player, name='get_tournaments_by_player'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)