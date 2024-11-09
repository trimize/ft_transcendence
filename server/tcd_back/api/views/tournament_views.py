from django.db.models import Q
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from ..models import Tournament, Match_Record
from ..serializer import TournamentSerializer, MatchSerializer

@api_view(['GET'])
# @permission_classes([IsAuthenticated])
def get_tournaments(request):
	tournaments = Tournament.objects.all()
	serializer = TournamentSerializer(tournaments, many=True)
	return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_tournament(request):
	serializer = TournamentSerializer(data=request.data)
	if serializer.is_valid():
		serializer.save()
		return Response(serializer.data, status=status.HTTP_201_CREATED)
	return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_tournament(request):
	tournament_id = request.data.get('id')
	if not tournament_id:
		return Response({'error': 'ID is required'}, status=status.HTTP_400_BAD_REQUEST)

	try:
		tournament = Tournament.objects.get(id=tournament_id)
	except Tournament.DoesNotExist:
		return Response(status=status.HTTP_404_NOT_FOUND)

	serializer = TournamentSerializer(tournament, data=request.data, partial=True)
	if serializer.is_valid():
		serializer.save()
		return Response(serializer.data)
	return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_tournament(request, pk):
	try:
		tournament = Tournament.objects.get(pk=pk)
	except Tournament.DoesNotExist:
		return Response(status=status.HTTP_404_NOT_FOUND)
	return Response(TournamentSerializer(tournament).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_tournament_from_match(request, pk):
    try:
        match = Match_Record.objects.get(pk=pk)
    except Match_Record.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    tournament = Tournament.objects.filter(
        Q(match1=match) | Q(match2=match) | Q(playoff=match) | Q(final_match=match)
    ).first()  # Use .first() to get a single object if it exists

    if not tournament:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    return Response(TournamentSerializer(tournament).data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_tournaments_by_player(request):
	user = request.user
	# Get the type parameter from the url
	requestType = request.GET.get('type', 'finished')

	if requestType == 'all':
		tournaments = Tournament.objects.filter(
			Q(player1=user) | Q(player2=user) | Q(player3=user) | Q(player4=user)
		)
	elif requestType == 'finished':
		tournaments = Tournament.objects.filter(
			Q(player1=user) | Q(player2=user) | Q(player3=user) | Q(player4=user)
		).filter(match1__end_time__isnull=False, match2__end_time__isnull=False, playoff__end_time__isnull=False, final_match__end_time__isnull=False)
	elif requestType == 'unfinished':
		tournaments = Tournament.objects.filter(
			Q(player1=user) | Q(player2=user) | Q(player3=user) | Q(player4=user)
		).filter(Q(match1__end_time__isnull=True) | Q(match2__end_time__isnull=True) | Q(playoff__end_time__isnull=True) | Q(final_match__end_time__isnull=True))
	else:
		return Response({'error': 'Invalid type'}, status=status.HTTP_400_BAD_REQUEST)

	serializer = TournamentSerializer(tournaments, many=True)


