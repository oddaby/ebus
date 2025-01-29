from rest_framework import serializers
from .models import CustomUser
from django.contrib.auth.password_validation import validate_password

# users/serializers.py
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, 
        required=True,
        style={'input_type': 'password'},
        validators=[validate_password]
    )
    
    class Meta:
        model = CustomUser
        fields = ['email', 'password', 'phone_number', 'first_name', 'last_name']
        extra_kwargs = {
            'email': {'required': True},
            'phone_number': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True}
        }

    def create(self, validated_data):
        return CustomUser.objects.create_user(**validated_data)
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['email', 'first_name', 'last_name', 'phone_number', 'user_type']