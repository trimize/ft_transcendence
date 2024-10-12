from rest_framework import serializers
from .models import User, Match_Record

class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = '__all__'

class MatchSerializer(serializers.ModelSerializer):
	class Meta:
		model = Match_Record
		fields = '__all__'