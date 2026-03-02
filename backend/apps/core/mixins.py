class TenantQuerysetMixin:
    """Automatically scopes querysets to the current user's organization.
    Any viewset using this mixin will never leak data across tenants."""

    def get_queryset(self):
        queryset = super().get_queryset()
        if hasattr(self.request.user, 'organization') and self.request.user.organization:
            return queryset.filter(organization=self.request.user.organization)
        return queryset.none()
