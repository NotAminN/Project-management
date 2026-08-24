from rest_framework import viewsets, permissions
from django.db.models import Q
from .models import Task
from .serializers import TaskSerializer

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status', 'priority', 'project', 'assigned_to']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'due_date', 'priority']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'Admin':
            return Task.objects.all()
        return Task.objects.filter(
            Q(project__owner=user) | Q(project__members__user=user)
        ).distinct()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
