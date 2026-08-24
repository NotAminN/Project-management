from django.contrib import admin
from .models import Comment

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('task', 'author', 'created_at', 'updated_at')
    list_filter = ('task', 'author')
    search_fields = ('content', 'author__username', 'task__title')
    ordering = ('-created_at',)
