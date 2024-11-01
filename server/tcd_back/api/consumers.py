import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import User

user_channels = {}

class SocketConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		# user_id = self.scope['user'].id
		# user_channels[user_id] = self.channel_name
		# print(f"User {user_id} connected")
		# print(f"User channels: {user_channels}")
		await self.accept()

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

		# Iterate through friends and send a message to connected friends
		for friend in friends:
			friend_id = str(friend.id)
			if friend_id in user_channels:
				message = {
					'type': 'friend_disconnected',
					'userId': user_id,
				}
				await self.channel_layer.send(
					user_channels[friend_id],
					{
					'type': 'send_message',
					'message': message
					}
				)

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
						await self.channel_layer.send(
							user_channels[friend_id],
							{
							'type': 'send_message',
							'message': message
							}
						)
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
					await self.channel_layer.send(
						invitee_channel_name,
						{
							'type': 'send_message',
							'message': text_data_json
						}
					)
				else:
					print(f"User {invitee_id} is not connected")
			elif text_data_json['type'] == 'refuse_invite':
				host_id = str(text_data_json.get('hostId'))
				if host_id in user_channels:
					host_channel_name = user_channels.get(host_id)
					print(f"Sending refusal to user {host_id} on channel {host_channel_name}")
					await self.channel_layer.send(
						host_channel_name,
						{
							'type': 'invite_refused',
							'message': text_data_json
						}
					)
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
				await self.channel_layer.send(
					receiver_channel_name,
					{
						'type': 'send_message',
						'message': text_data_json
					}
				)
				await self.channel_layer.send(
					self.channel_name,
					{
						'type': 'send_message',
						'message': text_data_json
					}
				)
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
				await self.channel_layer.send(
					opponent_channel_name,
					{
						'type': 'send_message',
						'message': text_data_json
					}
				)
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
				await self.channel_layer.send(
					player1_channel_name,
					{
						'type': 'send_message',
						'message': text_data_json
					}
				)
				await self.channel_layer.send(
					player2_channel_name,
					{
						'type': 'send_message',
						'message': text_data_json
					}
				)
			


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