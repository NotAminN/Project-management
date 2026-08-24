from django.db import models
from django.conf import settings

class Project(models.Model):
    STATUS_CHOICES = (
        ('Planning', 'Planning'),
        ('Active', 'Active'),
        ('On Hold', 'On Hold'),
        ('Completed', 'Completed'),
        ('Archived', 'Archived'),
    )
    PRIORITY_CHOICES = (
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Critical', 'Critical'),
    )

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owned_projects')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Planning')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Medium')
    start_date = models.DateField(blank=True, null=True)
    deadline = models.DateField(blank=True, null=True)
    progress = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class ProjectMember(models.Model):
    ROLE_CHOICES = (
        ('Manager', 'Manager'),
        ('Member', 'Member'),
        ('Viewer', 'Viewer'),
    )
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='project_memberships')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='Member')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('project', 'user')

    def __str__(self):
        return f"{self.user.username} - {self.project.title}"
