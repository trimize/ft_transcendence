import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import User, Match_Record
from django.utils import timezone
from asgiref.sync import sync_to_async

user_channels = {}
matchmaking = []

class SocketConsumer(AsyncWebsocketConsumer):

	async def ws_send(self, receiver, message):
		await self.channel_layer.send(
			receiver,
			{
				'type': 'send_message',
				'message': message
			}
		)

	async def connect(self):
		# user_id = self.scope['user'].id
		# user_channels[user_id] = self.channel_name
		# print(f"User {user_id} connected")
		# print(f"User channels: {user_channels}")
		await self.accept()
		user_id = None
		for uid, channel_name in user_channels.items():
			if channel_name == self.channel_name:
				user_id = uid
				break

		if user_id:
		# Remove the user from the user_channels dictionary
			del user_channels[user_id]

		# Fetch the user and their friends
		try:
			user = await database_sync_to_async(User.objects.get)(id=user_id)
			friends = await database_sync_to_async(lambda: list(user.friends.all()))()
		except User.DoesNotExist:
			print("User does not exist")
			return

		print(f"User {user_id} disconnected")
		# Iterate through friends and send a message to connected friends
		for friend in friends:
			friend_id = str(friend.id)
			if friend_id in user_channels:
				message = {
					'type': 'friend_connected',
					'userId': user_id,
				}
				print(f"Sending disconnect message to user {friend_id}")
				await self.ws_send(user_channels.get(friend_id), message)
				# await self.channel_layer.send(
				# 	user_channels.get(friend_id),
				# 	{
				# 	'type': 'send_message',
				# 	'message': message
				# 	}
				# )

	async def disconnect(self, close_code):
		# Find the user ID by channel name
		user_id = None
		for uid, channel_name in user_channels.items():
			if channel_name == self.channel_name:
				user_id = uid
				break

		if user_id:
		# Remove the user from the user_channels dictionary
			del user_channels[user_id]

		# Fetch the user and their friends
		try:
			user = await database_sync_to_async(User.objects.get)(id=user_id)
			friends = await database_sync_to_async(lambda: list(user.friends.all()))()
		except User.DoesNotExist:
			print("User does not exist")
			return

		print(f"User {user_id} disconnected")
		# Iterate through friends and send a message to connected friends
		for friend in friends:
			friend_id = str(friend.id)
			if friend_id in user_channels:
				message = {
					'type': 'friend_disconnected',
					'userId': user_id,
				}
				print(f"Sending disconnect message to user {friend_id}")
				await self.ws_send(user_channels.get(friend_id), message)
				# await self.channel_layer.send(
				# 	user_channels.get(friend_id),
				# 	{
				# 	'type': 'send_message',
				# 	'message': message
				# 	}
				# )

		for match in matchmaking:
			if match.get('playerId') == user_id:
				matchmaking.remove(match)
				break

	async def receive(self, text_data):
		try:
			text_data_json = json.loads(text_data)
		except json.JSONDecodeError as e:
			print(f"JSONDecodeError: {e}")
			await self.close()
			return

		if 'type' in text_data_json:
			if text_data_json['type'] == 'new_connection':
				user_id = str(text_data_json.get('userId'))
				print(f"JSON data: {text_data_json}")
				if not text_data_json.get('userId'):
					print("User ID not provided")
					return
				user_channels[user_id] = self.channel_name
				print(f"User {user_id} connected")
				print(f"User channels: {user_channels}")

				# Fetch the user and their friends
				try:
					user = await database_sync_to_async(User.objects.get)(id=user_id)
					friends = await database_sync_to_async(lambda: list(user.friends.all()))()
				except User.DoesNotExist:
					print("User does not exist")
					return

				# Iterate through friends and send a message to connected friends
				for friend in friends:
					friend_id = str(friend.id)
					if friend_id in user_channels:
						message = {
							'type': 'friend_connected',
							'userId': user_id
						}
						await self.ws_send(user_channels.get(friend_id), message)
						# await self.channel_layer.send(
						# 	user_channels.get(friend_id),
						# 	{
						# 	'type': 'send_message',
						# 	'message': message
						# 	}
						# )
			elif text_data_json['type'] == 'new_match':
				match_id = text_data_json.get('matchId')
				if not match_id:
					print("Match ID not provided")
					return
				self.room_group_name = f'match_{match_id}'
				print(f"Adding to group: {self.room_group_name}")
				await self.channel_layer.group_add(
					self.room_group_name,
					self.channel_name
				)
			elif text_data_json['type'] == 'new_tournament':
				tournament_id = text_data_json.get('tournamentId')
				if not tournament_id:
					print("tournament ID not provided")
					return
				self.room_group_name = f'tournament_{tournament_id}'
				print(f"Adding to group: {self.room_group_name}")
				await self.channel_layer.group_add(
					self.room_group_name,
					self.channel_name
				)
			elif text_data_json['type'] == 'match_update':
				print("hey im here")
				print(text_data_json)
				match_id = text_data_json.get('matchId')
				self.room_group_name = f'match_{match_id}'
				player1 = user_channels.get(str(text_data_json.get('hostId')))
				player2 = user_channels.get(str(text_data_json.get('inviteeId')))
				print(f"Sending update to group: {self.room_group_name}")
				await self.channel_layer.group_add(
					self.room_group_name,
					player1,
				)
				await self.channel_layer.group_add(
					self.room_group_name,
					player2,
				)
				await self.channel_layer.group_send(
					self.room_group_name,
					{
						'type': 'send_message',
						'message': text_data_json
					}
				)
			elif text_data_json['type'] == 'accept_invite':
				invitee_id = str(text_data_json.get('inviteeId'))
				invitee_channel_name = user_channels.get(invitee_id)
				if not invitee_channel_name:
					print(f"Invitee {invitee_id} not connected")
					return
				match_id = text_data_json.get('matchId')
				if not match_id:
					tournament_id = text_data_json.get('tournamentId')
					if not tournament_id:
						print("Tournament ID or Match ID not provided")
						return
					self.room_group_name = f'tournament_{tournament_id}'
				else:
					self.room_group_name = f'match_{match_id}'
				print(f"Adding to group: {self.room_group_name}")
				await self.channel_layer.group_add(
					self.room_group_name,
					invitee_channel_name
				)
				await self.channel_layer.group_send(
					self.room_group_name,
					{
						'type': 'send_message',
						'message': text_data_json
					}
				)
			elif text_data_json['type'] == 'send_invite':
				invitee_id = str(text_data_json.get('inviteeId'))
				if invitee_id in user_channels:
					invitee_channel_name = user_channels.get(invitee_id)
					print(f"Sending invite to user {invitee_id} on channel {invitee_channel_name}")
					await self.ws_send(invitee_channel_name, text_data_json)
					# await self.channel_layer.send(
					# 	invitee_channel_name,
					# 	{
					# 		'type': 'send_message',
					# 		'message': text_data_json
					# 	}
					# )
				else:
					print(f"User {invitee_id} is not connected")
			elif text_data_json['type'] == 'refuse_invite':
				host_id = str(text_data_json.get('hostId'))
				if host_id in user_channels:
					host_channel_name = user_channels.get(host_id)
					print(f"Sending refusal to user {host_id} on channel {host_channel_name}")
					await self.ws_send(host_channel_name, text_data_json)
					# await self.channel_layer.send(
					# 	host_channel_name,
					# 	{
					# 		'type': 'send_message',
					# 		'message': text_data_json
					# 	}
					# )
			elif text_data_json['type'] == 'chat_message':
				sender_id = str(text_data_json.get('senderId'))
				receiver_id = str(text_data_json.get('receiverId'))

				if receiver_id in user_channels:
					receiver_channel_name = user_channels.get(receiver_id)
				else:
					print(f"User {receiver_id} is not connected")
					await self.channel_layer.send(
						self.channel_name,
						{
							'type': 'send_message',
							'message': {
								'text': 'User is not connected'
							}
						}
					)
					return
				print(f"Sending message to user {receiver_id} on channel {receiver_channel_name}")
				await self.ws_send(receiver_channel_name, text_data_json)
				# await self.channel_layer.send(
				# 	receiver_channel_name,
				# 	{
				# 		'type': 'send_message',
				# 		'message': text_data_json
				# 	}
				# )
				await self.ws_send(self.channel_name, text_data_json)
				# await self.channel_layer.send(
				# 	self.channel_name,
				# 	{
				# 		'type': 'send_message',
				# 		'message': text_data_json
				# 	}
				# )
			elif text_data_json['type'] == 'tournament_invite':
				invitee_id = str(text_data_json.get('inviteeId'))
				if invitee_id in user_channels:
					invitee_channel_name = user_channels.get(invitee_id)
					print(f"Sending tournament invite to user {invitee_id} on channel {invitee_channel_name}")
					await self.ws_send(invitee_channel_name, text_data_json)
					# await self.channel_layer.send(
					# 	invitee_channel_name,
					# 	{
					# 		'type': 'send_message',
					# 		'message': text_data_json
					# 	}
					# )
				else:
					print(f"User {invitee_id} is not connected")
			elif text_data_json['type'] == 'tournament_invite_response':
				host_id = str(text_data_json.get('hostId'))
				if host_id in user_channels:
					host_channel_name = user_channels.get(host_id)
					print(f"Sending tournament invite to user {host_id} on channel {host_channel_name}")
					await self.ws_send(host_channel_name, text_data_json)
					# await self.channel_layer.send(
					# 	host_channel_name,
					# 	{
					# 		'type': 'send_message',
					# 		'message': text_data_json
					# 	}
					# )
				else:
					print(f"User {host_id} is not connected")
			elif text_data_json['type'] == 'tournament_update':
				tournament_id = str(text_data_json.get('id'))
				self.room_group_name = f'tournament_{tournament_id}'
				player1 = user_channels.get(str(text_data_json.get('player1')))
				player2 = user_channels.get(str(text_data_json.get('player2')))
				player3 = user_channels.get(str(text_data_json.get('player3')))
				player4 = user_channels.get(str(text_data_json.get('player4')))
				if not tournament_id:
					print("Tournament ID not provided")
					return
				players = [player1, player2, player3, player4]
				for player in players:
					if player is not None:
						await self.channel_layer.group_add(self.room_group_name, player)
				await self.channel_layer.group_send(
					self.room_group_name,
					{
						'type': 'send_message',
						'message': text_data_json
					}
				)
			elif text_data_json['type'] == 'tournament_match':
				match_id = str(text_data_json.get('match_id'))
				player2 = user_channels.get(str(text_data_json.get('opponentId')))
				if not match_id:
					print("match ID not provided")
					return
				if player2 is not None:
					await self.ws_send(player2, text_data_json)
					# await self.channel_layer.send(
					# 	player2,
					# 	{
					# 		'type': 'send_message',
					# 		'message': text_data_json
					# 	}
					# )
			elif text_data_json['type'] == 'waiting_state':
				opponent_id = str(text_data_json.get('opponentId'))
				match_id = text_data_json.get('matchId')
				if not match_id:
					print("Match ID not provided")
					return
				opponent_channel_name = user_channels.get(opponent_id)
				if not opponent_channel_name:
					print(f"Opponent {opponent_id} not connected")
					return
				print(f"Sending waiting state to user {opponent_id} on channel {opponent_channel_name}")
				await self.ws_send(opponent_channel_name, text_data_json)
				# await self.channel_layer.send(
				# 	opponent_channel_name,
				# 	{
				# 		'type': 'send_message',
				# 		'message': text_data_json
				# 	}
				# )
			elif text_data_json['type'] == 'allons-y':
				player1_id = str(text_data_json.get('player1'))
				player2_id = str(text_data_json.get('player2'))
				player1_channel_name = user_channels.get(player1_id)
				player2_channel_name = user_channels.get(player2_id)
				if not player1_channel_name:
					print(f"Player 1 {player1_id} not connected")
					return
				if not player2_channel_name:
					print(f"Player 2 {player2_id} not connected")
					return
				await self.ws_send(player1_channel_name, text_data_json)
				# await self.channel_layer.send(
				# 	player1_channel_name,
				# 	{
				# 		'type': 'send_message',
				# 		'message': text_data_json
				# 	}
				# )
				await self.ws_send(player2_channel_name, text_data_json)
				# await self.channel_layer.send(
				# 	player2_channel_name,
				# 	{
				# 		'type': 'send_message',
				# 		'message': text_data_json
				# 	}
				# )
			elif text_data_json['type'] == 'matchmaking':
				player_id = str(text_data_json.get('playerId'))
				game = text_data_json.get('game')
				print(f"Player {player_id} is matchmaking")
				print(f"Matchmaking: {matchmaking}")
				
				match_found = None
				for match in matchmaking:
					if match.get('game') == game:
						match_found = match
						break

				if match_found:
					print(f"Found a match for game {game}: {match_found}")
		
					game = 'tic-tac-toe' if game == 'ttt' else game
					# Create a new match record and save to the database
					match = await sync_to_async(Match_Record.objects.create)(
						game=game,
						player1_id=player_id,
						player2_id=match_found.get('playerId'),
						match_type='online_multiplayer',
						start_time=timezone.now()
					)
					await sync_to_async(match.save)()
					matchmaking.remove(match_found)
					# Send message to both players
					player1_channel_name = user_channels.get(player_id)
					player2_channel_name = user_channels.get(str(match_found.get('playerId')))
					message = {
								'type': 'allons-y',
								'player1': player_id,
								'player2': match_found.get('playerId'),
								'matchId': match.id
					}
					await self.ws_send(player1_channel_name, message)
					# await self.channel_layer.send(
					# 	player1_channel_name,
					# 	{
					# 		'type': 'send_message',
					# 		'message': message
					# 	}
					# )
					await self.ws_send(player2_channel_name, message)
					# await self.channel_layer.send(
					# 	player2_channel_name,
					# 	{
					# 		'type': 'send_message',
					# 		'message': message
					# 	}
					# )
				else:
					print(f"No match found for game {game}")
					matchmaking.append(text_data_json)
			elif text_data_json['type'] == 'friendRequest':
				senderId = str(text_data_json.get('senderId'))
				receiverId = str(text_data_json.get('receiverId'))
				receiver_channel_name = user_channels.get(receiverId)
				if not receiver_channel_name:
					print(f"Receiver {receiverId} not connected")
					return
				message = {
					'type': 'friendRequest',
					'senderId': senderId,
				}
				await self.ws_send(receiver_channel_name, message)
				# await self.channel_layer.send(
				# 	receiver_channel_name,
				# 	{
				# 		'type': 'send_message',
				# 		'message': message
				# 	}
				# )
			elif text_data_json['type'] == 'friendRequestAccepted':
				senderId = str(text_data_json.get('senderId'))
				receiverId = str(text_data_json.get('receiverId'))
				receiver_channel_name = user_channels.get(receiverId)
				if not receiver_channel_name:
					print(f"Receiver {receiverId} not connected")
					return
				message = {
					'type': 'friendRequestAccepted',
					'senderId': senderId,
				}
				await self.ws_send(receiver_channel_name, message)
				# await self.channel_layer.send(
				# 	receiver_channel_name,
				# 	{
				# 		'type': 'send_message',
				# 		'message': message
				# 	}
				# )
			elif text_data_json['type'] == 'friendRequestRefused':
				senderId = str(text_data_json.get('senderId'))
				receiverId = str(text_data_json.get('receiverId'))
				receiver_channel_name = user_channels.get(receiverId)
				if not receiver_channel_name:
					print(f"Receiver {receiverId} not connected")
					return
				message = {
					'type': 'friendRequestRefused',
					'senderId': senderId,
				}
				await self.ws_send(receiver_channel_name, message)
				# await self.channel_layer.send(
				# 	receiver_channel_name,
				# 	{
				# 		'type': 'send_message',
				# 		'message': message
				# 	}
				# )

				
			


	async def send_message(self, event):
		message = event['message']
		print(f"Sending message: {message}")
		await self.send(text_data=json.dumps(message))

	# async def chat_message(self, event):
	#     message = event['message']

	#     # Send message to WebSocket
	#     await self.send(text_data=json.dumps({
	#         'message': message
	#     }))