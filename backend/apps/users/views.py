from rest_framework import generics, permissions, status
from rest_framework.response import Response

from permissions.rbac import IsAdmin
from .models import User
from .serializers import RegisterSerializer, UserSerializer


class RegisterView(generics.CreateAPIView):
    """Only admins can register new users within their organization."""
    serializer_class = RegisterSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]


class MeView(generics.RetrieveAPIView):
    """Returns the currently authenticated user's profile."""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserListView(generics.ListAPIView):
    """Admins can list all users in their organization."""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get_queryset(self):
        return User.objects.filter(organization=self.request.user.organization)
