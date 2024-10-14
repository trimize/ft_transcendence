import json
from channels.generic.websocket import AsyncWebsocketConsumer

user_channels = {}

class SocketConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		# user_id = self.scope['user'].id
		# user_channels[user_id] = self.channel_name
		# print(f"User {user_id} connected")
		# print(f"User channels: {user_channels}")
		await self.accept()

	async def disconnect(self, close_code):
		# Leave room group
		user_id = self.scope['user'].id
		if user_id in user_channels:
			del user_channels[user_id]

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
				if not user_id:
					print("User ID not provided")
					return
				user_channels[user_id] = self.channel_name
				print(f"User {user_id} connected")
				print(f"User channels: {user_channels}")
			if text_data_json['type'] == 'new_match':
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
			elif text_data_json['type'] == 'match_update':
				match_id = text_data_json.get('matchId')
				self.room_group_name = f'match_{match_id}'
				print(f"Sending update to group: {self.room_group_name}")
				await self.channel_layer.group_send(
					self.room_group_name,
					{
						'type': 'match_update_response',
						'message': text_data_json
					}
				)
			elif text_data_json['type'] == 'send_invite':
				invitee_id = str(text_data_json.get('inviteeId'))
				print(f"Sending invite to user {invitee_id}")
				invitee_channel_name = user_channels.get(invitee_id)
				print(f"Invitee channel name: {invitee_channel_name}")
				match_id = text_data_json.get('matchId')
				if not match_id:
					print("Match ID not provided")
					return
				self.room_group_name = f'match_{match_id}'
				print(f"Adding to group: {self.room_group_name}")
				await self.channel_layer.group_add(
					self.room_group_name,
					invitee_channel_name
				)
				# if invitee_id in user_channels:
				#     invitee_channel_name = user_channels[invitee_id]
				#     print(f"Sending invite to user {invitee_id} on channel {invitee_channel_name}")
				#     await self.channel_layer.send(
				#         invitee_channel_name,
				#         {
				#             'type': 'receive_invite',
				#             'message': text_data_json
				#         }
				#     )
				# else:
				#     print(f"User {invitee_id} is not connected")

	async def match_update_response(self, event):
		message = event['message']
		print(f"Sending message: {message}")
		await self.send(text_data=json.dumps(message))

	async def receive_invite(self, event):
		message = event['message']
		print(f"Received invite: {message}")
		await self.send(text_data=json.dumps(message))

	# async def chat_message(self, event):
	#     message = event['message']

	#     # Send message to WebSocket
	#     await self.send(text_data=json.dumps({
	#         'message': message
	#     }))