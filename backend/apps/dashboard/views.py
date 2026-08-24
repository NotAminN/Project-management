from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from apps.projects.models import Project
from apps.tasks.models import Task
from django.db.models import Q

class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == 'Admin':
            projects = Project.objects.all()
            tasks = Task.objects.all()
        else:
            projects = Project.objects.filter(Q(owner=user) | Q(members__user=user)).distinct()
            tasks = Task.objects.filter(Q(project__owner=user) | Q(project__members__user=user)).distinct()
            
        data = {
            'total_projects': projects.count(),
            'active_projects': projects.exclude(status__in=['Completed', 'Archived']).count(),
            'completed_projects': projects.filter(status='Completed').count(),
            'total_tasks': tasks.count(),
            'completed_tasks': tasks.filter(status='Completed').count(),
            'pending_tasks': tasks.exclude(status='Completed').count(),
            'recent_projects': projects.order_by('-created_at')[:5].values('id', 'title', 'status', 'progress'),
            'recent_tasks': tasks.order_by('-created_at')[:5].values('id', 'title', 'status', 'project__title')
        }
        return Response(data)
