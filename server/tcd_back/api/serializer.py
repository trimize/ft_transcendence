from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import User, Match_Record

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password', 'profile_pic', 'friends', 'blocked_friends',
            'pong_ball', 'pong_slider', 'tic_tac_toe_sign', 'tic_tac_toe_background',
            'wins', 'losses'
        ]
        extra_kwargs = {'password': {'write_only': True, 'required': False}}

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        user = User.objects.create(**validated_data)
        return user

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            instance.password = make_password(validated_data['password'])
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        instance.profile_pic = validated_data.get('profile_pic', instance.profile_pic)
        instance.pong_ball = validated_data.get('pong_ball', instance.pong_ball)
        instance.pong_slider = validated_data.get('pong_slider', instance.pong_slider)
        instance.tic_tac_toe_sign = validated_data.get('tic_tac_toe_sign', instance.tic_tac_toe_sign)
        instance.tic_tac_toe_background = validated_data.get('tic_tac_toe_background', instance.tic_tac_toe_background)
        instance.save()
        return instance

class MatchSerializer(serializers.ModelSerializer):
	class Meta:
		model = Match_Record
		fields = '__all__'