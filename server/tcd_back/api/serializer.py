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
        if 'password' in validated_data and validated_data['password'] is not None:
            instance.password = make_password(validated_data['password'])
        
        if 'username' in validated_data and validated_data['username'] is not None:
            instance.username = validated_data['username']
        
        if 'email' in validated_data and validated_data['email'] is not None:
            instance.email = validated_data['email']
        
        if 'profile_pic' in validated_data and validated_data['profile_pic'] is not None:
            instance.profile_pic = validated_data['profile_pic']
        
        if 'pong_ball' in validated_data and validated_data['pong_ball'] is not None:
            instance.pong_ball = validated_data['pong_ball']
        
        if 'pong_slider' in validated_data and validated_data['pong_slider'] is not None:
            instance.pong_slider = validated_data['pong_slider']
        
        if 'tic_tac_toe_sign' in validated_data and validated_data['tic_tac_toe_sign'] is not None:
            instance.tic_tac_toe_sign = validated_data['tic_tac_toe_sign']
        
        if 'tic_tac_toe_background' in validated_data and validated_data['tic_tac_toe_background'] is not None:
            instance.tic_tac_toe_background = validated_data['tic_tac_toe_background']
        
        if 'friends' in validated_data and validated_data['friends'] is not None:
            instance.friends.set(validated_data['friends'])
        
        instance.save()
        return instance
    
class MatchSerializer(serializers.ModelSerializer):
	class Meta:
		model = Match_Record
		fields = '__all__'

class FriendInvitationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile_pic']
        extra_kwargs = {'username': {'read_only': True}, 'email': {'read_only': True}, 'profile_pic': {'read_only': True}}