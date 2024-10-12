from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from ..models import User
from ..serializer import UserSerializer

@api_view(['GET'])
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

@api_view(['PUT'])
def update_user(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    serializer = UserSerializer(user, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def delete_user(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    user.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
def get_user(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    serializer = UserSerializer(user)
    return Response(serializer.data)

@api_view(['GET'])
def search_user(request, name):
    user = User.objects.filter(name__icontains=name)
    serializer = UserSerializer(user, many=True)
    return Response(serializer.data)

@api_view(['PUT'])
def add_friend(request, pk, new_friend):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    friend = User.objects.get(pk=new_friend)
    user.friends.add(friend)
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['DELETE'])
def remove_friend(request, pk, friend):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    friend = User.objects.get(pk=friend)
    user.friends.remove(friend)
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['PUT'])
def block_friend(request, pk, friend):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    friend = User.objects.get(pk=friend)

    if user.blocked_friends.filter(pk=friend).exists():
        user.blocked_friends.remove(friend)
        return Response(status=status.HTTP_204_NO_CONTENT)

    user.blocked_friends.add(friend)
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['PUT'])
def update_pong_ball(request, pk, pong_ball):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    user.pong_ball = pong_ball
    user.save()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['PUT'])
def update_pong_slider(request, pk, pong_slider):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    user.pong_slider = pong_slider
    user.save()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['PUT'])
def update_tic_tac_toe_sign(request, pk, tic_tac_toe_sign):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    user.tic_tac_toe_sign = tic_tac_toe_sign
    user.save()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['PUT'])
def update_tic_tac_toe_background(request, pk, tic_tac_toe_background):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    user.tic_tac_toe_background = tic_tac_toe_background
    user.save()
    return Response(status=status.HTTP_204_NO_CONTENT)
