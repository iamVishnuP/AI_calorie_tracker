from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile
from rest_framework_simplejwt.tokens import RefreshToken

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            'id', 'gender', 'age', 'height_cm', 'weight_kg', 
            'activity_level', 'goal_type', 'daily_calorie_target', 
            'daily_protein_target', 'daily_carbs_target', 'daily_fat_target'
        ]

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    age = serializers.IntegerField(required=False, default=25)
    gender = serializers.CharField(required=False, default='M')
    height_cm = serializers.FloatField(required=False, default=175.0)
    weight_kg = serializers.FloatField(required=False, default=70.0)
    activity_level = serializers.CharField(required=False, default='moderate')
    goal_type = serializers.CharField(required=False, default='maintain')

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'age', 'gender', 'height_cm', 'weight_kg', 'activity_level', 'goal_type']

    def create(self, validated_data):
        profile_data = {
            'age': validated_data.pop('age', 25),
            'gender': validated_data.pop('gender', 'M'),
            'height_cm': validated_data.pop('height_cm', 175.0),
            'weight_kg': validated_data.pop('weight_kg', 70.0),
            'activity_level': validated_data.pop('activity_level', 'moderate'),
            'goal_type': validated_data.pop('goal_type', 'maintain'),
        }
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        # Update auto-created profile
        profile = user.profile
        for key, val in profile_data.items():
            setattr(profile, key, val)
        profile.update_targets_from_profile()
        profile.save()
        return user
