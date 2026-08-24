from django.urls import path
from .views import RegisterView, UserProfileView, UserListView

urlpatterns = [
    path('', UserListView.as_view(), name='user_list'),
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
]
