import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.core.serializers.json import DjangoJSONEncoder

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.conversation_id = str(self.scope['url_route']['kwargs']['conversation_id'])
        self.room_group_name = f'chat_{self.conversation_id}'

        await self.channel_layer.group_add(
            self.room_group_name, 
            self.channel_name
        )
        
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name, 
            self.channel_name
        )

    async def chat_message(self, event):
        message_data = event['message']

        await self.send(text_data=json.dumps({
            'type': 'new_message',
            'message': message_data
        }, cls=DjangoJSONEncoder))

    async def messages_read(self, event):
        await self.send(text_data=json.dumps({
            'type': 'messages_read',
            'reader_email': event['reader_email']
        }))