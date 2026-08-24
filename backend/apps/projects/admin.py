from django.contrib import admin
from .models import Project, ProjectMember

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'status', 'priority', 'progress', 'start_date', 'deadline', 'created_at')
    list_filter = ('status', 'priority')
    search_fields = ('title', 'description', 'owner__username')
    ordering = ('-created_at',)

@admin.register(ProjectMember)
class ProjectMemberAdmin(admin.ModelAdmin):
    list_display = ('project', 'user', 'role', 'joined_at')
    list_filter = ('role',)
    search_fields = ('project__title', 'user__username')
