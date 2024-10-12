from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import User, Match_Record

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password', 'friends', 'blocked_friends',
            'pong_ball', 'pong_slider', 'tic_tac_toe_sign', 'tic_tac_toe_background',
            'wins', 'losses'
        ]
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        user = User.objects.create(**validated_data)
        return user

class MatchSerializer(serializers.ModelSerializer):
	class Meta:
		model = Match_Record
		fields = '__all__'