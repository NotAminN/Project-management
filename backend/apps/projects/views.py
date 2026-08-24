from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from .models import Project, ProjectMember
from .serializers import ProjectSerializer, ProjectMemberSerializer
from apps.users.models import User

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status', 'priority']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'deadline', 'progress']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'Admin':
            return Project.objects.all()
        return Project.objects.filter(Q(owner=user) | Q(members__user=user)).distinct()

    def perform_create(self, serializer):
        project = serializer.save(owner=self.request.user)
        ProjectMember.objects.create(project=project, user=self.request.user, role='Manager')

    @action(detail=True, methods=['post', 'get'])
    def members(self, request, pk=None):
        project = self.get_object()
        
        if request.method == 'GET':
            members = project.members.all()
            serializer = ProjectMemberSerializer(members, many=True)
            return Response(serializer.data)
            
        elif request.method == 'POST':
            is_manager = project.members.filter(user=request.user, role='Manager').exists()
            if request.user != project.owner and not is_manager and request.user.role != 'Admin':
                return Response({'detail': 'Not permitted.'}, status=status.HTTP_403_FORBIDDEN)
                
            serializer = ProjectMemberSerializer(data=request.data)
            if serializer.is_valid():
                # check if user exists
                try:
                    User.objects.get(id=serializer.validated_data['user_id'])
                except User.DoesNotExist:
                    return Response({'detail': 'User not found.'}, status=status.HTTP_400_BAD_REQUEST)
                
                serializer.save(project=project)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'], url_path='members/(?P<member_id>[^/.]+)')
    def remove_member(self, request, pk=None, member_id=None):
        project = self.get_object()
        is_manager = project.members.filter(user=request.user, role='Manager').exists()
        if request.user != project.owner and not is_manager and request.user.role != 'Admin':
            return Response({'detail': 'Not permitted.'}, status=status.HTTP_403_FORBIDDEN)
            
        try:
            member = project.members.get(id=member_id)
            if member.user == project.owner:
                return Response({'detail': 'Cannot remove owner.'}, status=status.HTTP_400_BAD_REQUEST)
            member.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProjectMember.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
