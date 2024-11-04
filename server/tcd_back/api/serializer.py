import re
from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import User, Match_Record, FriendInvitation, Tournament


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password', 'profile_pic',
            'pong_ball', 'pong_slider', 'tic_tac_toe_sign', 'tic_tac_toe_background',
            'wins', 'losses', 'friends'
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

    def validate_username(self, value):
        if len(value) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters long")
        return value

    def validate_email(self, value):
        if not re.match(r"[^@]+@[^@]+\.[^@]+", value):
            raise serializers.ValidationError("Invalid email format")
        return value
    
class MatchSerializer(serializers.ModelSerializer):
	class Meta:
		model = Match_Record
		fields = '__all__'

class FriendInvitationSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)

    class Meta:
        model = FriendInvitation
        fields = ['id', 'sender', 'receiver', 'status', 'timestamp']

class TournamentSerializer(serializers.ModelSerializer):
    player1 = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    player2 = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False, allow_null=True)
    player3 = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False, allow_null=True)
    player4 = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False, allow_null=True)
    first_place = UserSerializer(read_only=True, required=False, allow_null=True)
    second_place = UserSerializer(read_only=True, required=False, allow_null=True)
    third_place = UserSerializer(read_only=True, required=False, allow_null=True)
    match1 = MatchSerializer(read_only=True, required=False, allow_null=True)
    match2 = MatchSerializer(read_only=True, required=False, allow_null=True)
    playoff = MatchSerializer(read_only=True, required=False, allow_null=True)
    final_match = MatchSerializer(read_only=True, required=False, allow_null=True)
    class Meta:
        model = Tournament
        fields = '__all__'