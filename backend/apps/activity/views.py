from rest_framework import viewsets, permissions

from apps.core.mixins import TenantQuerysetMixin
from .models import ActivityLog
from .serializers import ActivityLogSerializer


class ActivityLogViewSet(TenantQuerysetMixin, viewsets.ReadOnlyModelViewSet):
    """Read-only. Every authenticated user in the org can see the activity log."""
    queryset = ActivityLog.objects.all()
    serializer_class = ActivityLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering_fields = ['timestamp']

    def get_queryset(self):
        return super().get_queryset().select_related('user')
