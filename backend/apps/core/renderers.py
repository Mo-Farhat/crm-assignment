from rest_framework.renderers import JSONRenderer


class APIRenderer(JSONRenderer):
    """Wraps successful responses in the standard envelope: {success, message, data}."""

    def render(self, data, accepted_media_type=None, renderer_context=None):
        response = renderer_context.get('response') if renderer_context else None

        # don't double-wrap error responses (already handled by the exception handler)
        if response and response.status_code >= 400:
            return super().render(data, accepted_media_type, renderer_context)

        wrapped = {
            'success': True,
            'message': 'Operation successful',
            'data': data,
        }
        return super().render(wrapped, accepted_media_type, renderer_context)
