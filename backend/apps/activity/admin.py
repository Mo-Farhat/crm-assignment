from django.contrib import admin

from .models import ActivityLog


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ['action', 'model_name', 'user', 'organization', 'timestamp']
    list_filter = ['action', 'model_name', 'organization']
    readonly_fields = ['id', 'user', 'organization', 'action', 'model_name', 'object_id', 'timestamp']
    ordering = ['-timestamp']

    # prevent any create/edit/delete on logs through admin
    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
