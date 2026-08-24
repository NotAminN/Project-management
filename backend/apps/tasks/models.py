from django.db import models
from django.conf import settings
from apps.projects.models import Project

class Task(models.Model):
    STATUS_CHOICES = (
        ('Backlog', 'Backlog'),
        ('Todo', 'Todo'),
        ('In Progress', 'In Progress'),
        ('Review', 'Review'),
        ('Done', 'Done'),
    )
    PRIORITY_CHOICES = (
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Critical', 'Critical'),
    )

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tasks')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_tasks')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Todo')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Medium')
    due_date = models.DateField(blank=True, null=True)
    progress = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
