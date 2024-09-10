from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = 'User'  # Use the string name of the model here
        fields = ['id', 'username', 'password']
        extra_kwargs = {'password': {'write_only': True, 'required': True}}
    
    def create(self, validated_data):
        from django.contrib.auth.models import User  # Import here to avoid circular imports
        user = User.objects.create_user(**validated_data)
        return user
