class TenantMiddleware:
    """
    Attaches the user's organization to the request object so views
    can access it without re-querying. Runs after authentication middleware.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if hasattr(request, 'user') and request.user.is_authenticated:
            request.tenant = getattr(request.user, 'organization', None)
        else:
            request.tenant = None

        return self.get_response(request)
