from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from ..models import Match_Record
from ..serializer import MatchSerializer

@api_view(['GET'])
def get_matches(request):
	matches = Match_Record.objects.all()
	serializer = MatchSerializer(matches, many=True)
	return Response(serializer.data)

@api_view(['POST'])
def create_match(request):
	serializer = MatchSerializer(data=request.data)
	if serializer.is_valid():
		serializer.save()
		return Response(serializer.data, status=status.HTTP_201_CREATED)
	return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
def update_match(request, pk):
	try:
		match = Match_Record.objects.get(pk=pk)
	except Match_Record.DoesNotExist:
		return Response(status=status.HTTP_404_NOT_FOUND)

	serializer = MatchSerializer(match, data=request.data)
	if serializer.is_valid():
		serializer.save()
		return Response(serializer.data)
	return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def delete_match(request, pk):
	try:
		match = Match_Record.objects.get(pk=pk)
	except Match_Record.DoesNotExist:
		return Response(status=status.HTTP_404_NOT_FOUND)

	match.delete()
	return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
def get_match(request, pk):
	try:
		match = Match_Record.objects.get(pk=pk)
	except Match_Record.DoesNotExist:
		return Response(status=status.HTTP_404_NOT_FOUND)

	serializer = MatchSerializer(match)
	return Response(serializer.data)

@api_view(['GET'])
def get_match_by_player(request, player_id):
	matches = Match_Record.objects.filter(player1_id=player_id) | Match_Record.objects.filter(player2_id=player_id)
	serializer = MatchSerializer(matches, many=True)
	return Response(serializer.data)
