import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer

class SocketConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		await self.accept()

	async def disconnect(self, close_code):
		# Leave room group
		await self.channel_layer.group_discard(
			self.room_group_name,
			self.channel_name
		)

	async def receive(self, text_data):
		try:
			text_data_json = json.loads(text_data)
		except json.JSONDecodeError as e:
			logger.error(f"JSONDecodeError: {e}")
			await self.close()
			return
		
		if 'type' in text_data_json:
			if text_data_json['type'] == 'new_match':
				match_id = text_data_json.get('matchId')
				self.room_group_name = f'match_{match_id}'
				await self.channel_layer.group_add(
					self.room_group_name,
					self.channel_name
				)
			elif text_data_json['type'] == 'match_update':
				match_id = text_data_json.get('matchId')
				self.room_group_name = f'match_{match_id}'
				await self.channel_layer.group_send(
					self.room_group_name,
					{
						'type': 'match_update_response',
						'message': text_data_json
					}
				)

	async def match_update_response(self, event):
		message = event['message']
		await self.send(text_data=json.dumps(message))


	# async def chat_message(self, event):
	#     message = event['message']

	#     # Send message to WebSocket
	#     await self.send(text_data=json.dumps({
	#         'message': message
	#     }))