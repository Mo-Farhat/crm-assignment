from django.db import transaction

from .models import ActivityLog


class ActivityService:
    @staticmethod
    @transaction.atomic
    def log(user, organization, action: str, model_name: str, object_id) -> ActivityLog:
        """Creates a log entry atomically — if the main transaction rolls back, this rolls back too."""
        return ActivityLog.objects.create(
            user=user,
            organization=organization,
            action=action,
            model_name=model_name,
            object_id=object_id,
        )
