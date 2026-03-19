from typing import Dict
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password

from items.models import Location
from users.models import User

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

class UserDataSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    profile_pic = serializers.ImageField()

class UserResponseSerializer(serializers.Serializer):
    user = UserDataSerializer()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirmation = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'password', 'password_confirmation']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirmation']:
            raise serializers.ValidationError('Passwords not matching!')
        return attrs
        
    def create(self, validated_data: Dict):
        validated_data.pop('password_confirmation')
        user = User.objects.create_user(**validated_data)
        return user
    
class SuccessResponseSerializer(serializers.Serializer):
    message = serializers.CharField()

class UserDataEditSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email']

class AddLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['label', 'lat', 'lng', 'address']