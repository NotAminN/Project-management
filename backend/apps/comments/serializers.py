from rest_framework import serializers
from .models import Comment
from apps.users.serializers import UserSerializer

class CommentSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = Comment
        fields = '__all__'
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')
