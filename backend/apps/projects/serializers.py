from rest_framework import serializers
from .models import Project, ProjectMember
from apps.users.serializers import UserSerializer

class ProjectMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = ProjectMember
        fields = ('id', 'project', 'user', 'user_id', 'role', 'joined_at')
        read_only_fields = ('id', 'project', 'joined_at')

class ProjectSerializer(serializers.ModelSerializer):
    owner_details = UserSerializer(source='owner', read_only=True)
    name = serializers.CharField(source='title', required=False)
    start = serializers.DateField(source='start_date', required=False, allow_null=True)
    due = serializers.DateField(source='deadline', required=False, allow_null=True)
    code = serializers.SerializerMethodField()
    health = serializers.SerializerMethodField()
    memberIds = serializers.SerializerMethodField()
    
    def get_code(self, obj):
        return obj.title[:3].upper() if obj.title else "PRJ"
        
    def get_health(self, obj):
        return "Healthy"
        
    def get_memberIds(self, obj):
        return [m.user.id for m in obj.members.all()]

    class Meta:
        model = Project
        fields = ('id', 'name', 'title', 'description', 'owner', 'owner_details', 'status', 'priority', 'start', 'start_date', 'due', 'deadline', 'progress', 'code', 'health', 'memberIds', 'created_at', 'updated_at')
        read_only_fields = ('id', 'owner', 'created_at', 'updated_at')
