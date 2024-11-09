from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from ..models import Match_Record, Tournament
from ..serializer import MatchSerializer
from django.db.models import Q

@api_view(['GET'])
# @permission_classes([IsAuthenticated])
def get_matches(request):
	matches = Match_Record.objects.all()
	serializer = MatchSerializer(matches, many=True)
	return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_match(request):
	serializer = MatchSerializer(data=request.data)
	print("request.data")
	print(request.data)
	if serializer.is_valid():
		serializer.save()
		return Response(serializer.data, status=status.HTTP_201_CREATED)
	return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_match(request):
	match_id = request.data.get('id')
	if not match_id:
		return Response({'error': 'ID is required'}, status=status.HTTP_400_BAD_REQUEST)

	try:
		match = Match_Record.objects.get(id=match_id)
	except Match_Record.DoesNotExist:
		return Response(status=status.HTTP_404_NOT_FOUND)

	serializer = MatchSerializer(match, data=request.data, partial=True)
	if serializer.is_valid():
		serializer.save()
		return Response(serializer.data)
	return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_match(request, pk):
	try:
		match = Match_Record.objects.get(pk=pk)
	except Match_Record.DoesNotExist:
		return Response(status=status.HTTP_404_NOT_FOUND)

	serializer = MatchSerializer(match)
	return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_matches_by_player(request):
	user = request.user
	# Get the type parameter from the url
	requestType = request.GET.get('type', 'finished')

	if requestType == 'all':
		matches = Match_Record.objects.filter(player1_id=user.id) | Match_Record.objects.filter(player2_id=user.id)
	elif requestType == 'finished':
		matches = (Match_Record.objects.filter(player1_id=user.id) | Match_Record.objects.filter(player2_id=user.id)).filter(start_time__isnull=False, end_time__isnull=False)
	elif requestType == 'unfinished':
		matches = (Match_Record.objects.filter(player1_id=user.id) | Match_Record.objects.filter(player2_id=user.id)).filter(start_time__isnull=False, end_time__isnull=True)
	else:
		return Response({'error': 'Invalid type'}, status=status.HTTP_400_BAD_REQUEST)

	# Check if match is not part of a tournament

	for match in matches:
		tournaments = Tournament.objects.filter(
			Q(match1=match) | Q(match2=match) | Q(playoff=match) | Q(final_match=match)
		).first()
		if tournaments:
			matches = matches.exclude(id=match.id)
	
	serializer = MatchSerializer(matches, many=True)
	return Response(serializer.data)