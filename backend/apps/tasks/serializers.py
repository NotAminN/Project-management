from rest_framework import serializers
from .models import Task
from apps.users.serializers import UserSerializer
from apps.projects.serializers import ProjectSerializer

from django.contrib.auth import get_user_model
User = get_user_model()

class TaskSerializer(serializers.ModelSerializer):
    assigned_to_details = UserSerializer(source='assigned_to', read_only=True)
    created_by_details = UserSerializer(source='created_by', read_only=True)
    project_details = ProjectSerializer(source='project', read_only=True)
    
    assignee = serializers.PrimaryKeyRelatedField(source='assigned_to', queryset=User.objects.all(), required=False, allow_null=True)
    due = serializers.DateField(source='due_date', required=False, allow_null=True)
    code = serializers.SerializerMethodField()

    def get_code(self, obj):
        return f"TSK-{obj.id}" if obj.id else "TSK-0"

    class Meta:
        model = Task
        fields = ('id', 'project', 'project_details', 'title', 'description', 'assignee', 'assigned_to', 'assigned_to_details', 'created_by', 'created_by_details', 'status', 'priority', 'due', 'due_date', 'progress', 'code', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_by', 'created_at', 'updated_at')
