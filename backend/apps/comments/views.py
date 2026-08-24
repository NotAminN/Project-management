from rest_framework import viewsets, permissions
from .models import Comment
from .serializers import CommentSerializer

class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Allow viewing comments for tasks the user can see (for simplicity, just return all for now)
        # In a real app we would check task permissions
        return Comment.objects.all().order_by('-created_at')
        
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
