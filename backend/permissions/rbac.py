from rest_framework.permissions import BasePermission


class IsOrganizationMember(BasePermission):
    """Blocks anyone whose organization doesn't match the target resource."""

    def has_object_permission(self, request, view, obj):
        return (
            request.user.is_authenticated
            and hasattr(obj, 'organization')
            and obj.organization == request.user.organization
        )


class IsAdmin(BasePermission):
    """Grants access only to users with the admin role."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class IsManagerOrAdmin(BasePermission):
    """Grants access to managers and admins."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ('admin', 'manager')


class HasCRMWriteAccess(BasePermission):
    """
    Staff can create and update.
    Only admins can delete.
    Managers get full write access.
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if view.action in ('list', 'retrieve'):
            return True

        if view.action == 'destroy':
            return request.user.role in ('admin', 'manager')

        # create / update / partial_update
        return request.user.role in ('admin', 'manager', 'staff')
