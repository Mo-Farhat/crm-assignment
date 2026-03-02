from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """Wraps all error responses in the standard envelope format."""
    response = exception_handler(exc, context)

    if response is not None:
        # flatten DRF's error detail into a readable message
        if isinstance(response.data, dict):
            errors = response.data
            message = next(iter(errors.values())) if errors else str(exc)
            if isinstance(message, list):
                message = message[0]
        else:
            errors = response.data
            message = str(exc)

        response.data = {
            'success': False,
            'message': str(message),
            'errors': errors,
        }

    return response
