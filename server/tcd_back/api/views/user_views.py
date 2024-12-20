from django.contrib.auth import authenticate
from django_otp.plugins.otp_totp.models import TOTPDevice
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from ..models import User, Match_Record, FriendInvitation, BlockedUser, Tournament
from ..serializer import UserSerializer, FriendInvitationSerializer, BlockedUserSerializer
import random

@api_view(['GET'])
# @permission_classes([IsAuthenticated])
def get_users(request):
	users = User.objects.all()
	serializer = UserSerializer(users, many=True)
	return Response(serializer.data)

@api_view(['POST'])
def create_user(request):
	serializer = UserSerializer(data=request.data)
	if serializer.is_valid():
		serializer.save()
		return Response(serializer.data, status=status.HTTP_201_CREATED)
	return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)

    if user is not None:
        if TOTPDevice.objects.filter(user=user, confirmed=True).exists():
            # User has 2FA enabled, prompt for 2FA token
            return Response({'message': '2FA required'}, status=status.HTTP_200_OK)
        else:
            # User does not have 2FA enabled, return tokens
            refresh = RefreshToken.for_user(user)
            websocket_url = f"wss://{request.get_host()}/ws/api/"
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'websocket_url': websocket_url
            }, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def update_user(request):
    try:
        user = request.user
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    serializer = UserSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    serializer = UserSerializer(user)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_info(request):
    user = request.user
    serializer = UserSerializer(user)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_username(request, username):
    user = get_object_or_404(User, username=username)
    serializer = UserSerializer(user)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_friend_invitations_sent(request):
    user = request.user
    pending_invitations = FriendInvitation.objects.filter(sender=user, status='pending')
    serializer = FriendInvitationSerializer(pending_invitations, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_friend_invitations_received(request):
    user = request.user
    pending_invitations = FriendInvitation.objects.filter(receiver=user, status='pending')
    serializer = FriendInvitationSerializer(pending_invitations, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_user(request, username):
    user = User.objects.filter(username__icontains=username)
    serializer = UserSerializer(user, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_friend_request(request, friend_username):
    try:
        user = request.user
        friend = User.objects.get(username=friend_username)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if user == friend:
        print("here1")
        return Response(status=status.HTTP_400_BAD_REQUEST)
    if user.friends.filter(pk=friend.id).exists():
        print("here2")
        return Response(status=status.HTTP_400_BAD_REQUEST)
    if FriendInvitation.objects.filter(sender=user, receiver=friend, status='pending').exists():
        print("here3")
        return Response(status=status.HTTP_400_BAD_REQUEST)
    if BlockedUser.objects.filter(blocker=user, blocked=friend).exists():
        print("here4")
        return Response(status=status.HTTP_400_BAD_REQUEST)
    
    if FriendInvitation.objects.filter(sender=friend, receiver=user, status='pending').exists():
        add_friend(request, friend.id)
    
    FriendInvitation.objects.create(sender=user, receiver=friend, status='pending')
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def refuse_friend_request(request, friend):
    try:
        user = request.user
        friend = User.objects.get(pk=friend)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    try:
        invitation = FriendInvitation.objects.get(sender=friend, receiver=user, status='pending')
        invitation.status = 'refused'
        invitation.save()
    except FriendInvitation.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def add_friend(request, new_friend):
    try:
        user = request.user
        friend = User.objects.get(pk=new_friend)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    print("user is")
    print(user)
    print("friend is")
    print(friend)

    if user == friend:
        print("got here 1")
        return Response(status=status.HTTP_400_BAD_REQUEST)
    if user.friends.filter(pk=friend.id).exists():
        print("got here 2")
        return Response(status=status.HTTP_400_BAD_REQUEST)
    if not FriendInvitation.objects.filter(sender=friend, receiver=user, status='pending').exists():
        print("got here 3")
        return Response(status=status.HTTP_400_BAD_REQUEST)
    if BlockedUser.objects.filter(blocker=user, blocked=friend).exists():
        print("got here 4")
        return Response(status=status.HTTP_400_BAD_REQUEST)

    try:
        invitation = FriendInvitation.objects.get(sender=friend, receiver=user, status='pending')
        invitation.status = 'accepted'
        invitation.save(update_fields=['status'])
    except FriendInvitation.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    user.friends.add(friend)
    user.save()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_friend(request, friend):
    try:
        user = request.user
        friend = User.objects.get(pk=friend)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    user.friends.remove(friend)
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def block_friend(request, friend):
    try:
        user = request.user
        friend = User.objects.get(pk=friend)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    serializer = UserSerializer(friend)

    # Check if the friend is already blocked
    if BlockedUser.objects.filter(blocker=user, blocked=friend).exists():
        # Unblock the friend
        BlockedUser.objects.filter(blocker=user, blocked=friend).delete()
        return Response(serializer.data)

    # Block the friend
    user.friends.remove(friend)
    BlockedUser.objects.create(blocker=user, blocked=friend)
    user.save()
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_pong_ball(request, pong_ball):
    try:
        user = request.user
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    user.pong_ball = pong_ball
    user.save()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_pong_slider(request, pong_slider):
    try:
        user = request.user
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    user.pong_slider = pong_slider
    user.save()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_tic_tac_toe_sign(request, tic_tac_toe_sign):
    try:
        user = request.user
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    user.tic_tac_toe_sign = tic_tac_toe_sign
    user.save()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_tic_tac_toe_background(request, tic_tac_toe_background):
    try:
        user = request.user
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    user.tic_tac_toe_background = tic_tac_toe_background
    user.save()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def anonymize_user(request):
    user = request.user
    user.username = f'anon_{user.id}'
    user.email = user.username + '@42.fr'
    user.profile_pic = "profile_pics/default_user.jpg"
    user.save()

    user_data = {
        'username': user.username,
    }
    
    return Response(user_data, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_account(request):
    try:
        user = request.user
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    Match_Record.objects.filter(player1=user).update(player1=None)
    Match_Record.objects.filter(player2=user).update(player2=None)
    FriendInvitation.objects.filter(sender=user).delete()
    FriendInvitation.objects.filter(receiver=user).delete()
    BlockedUser.objects.filter(blocker=user).delete()
    BlockedUser.objects.filter(blocked=user).delete()
    Tournament.objects.filter(player1=user).delete()
    Tournament.objects.filter(player2=user).delete()
    Tournament.objects.filter(player3=user).delete()
    Tournament.objects.filter(player4=user).delete()
    Tournament.objects.filter(first_place=user).delete()
    Tournament.objects.filter(second_place=user).delete()
    Tournament.objects.filter(third_place=user).delete()
    user.friends.clear()

    user.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_friends(request):
    user = request.user
    friends = user.friends.all()  # Get all friends for the authenticated user
    serializer = UserSerializer(friends, many=True)  # Serialize the friends list
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_blocked_friends(request):
    user = request.user
    blocked_users = BlockedUser.objects.filter(blocker=user)
    serializer = BlockedUserSerializer(blocked_users, many=True)
    print("This is the blocked users")
    print(serializer.data)
    return Response(serializer.data)