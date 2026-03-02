import boto3
from botocore.exceptions import ClientError
from django.conf import settings


class S3PresignedURLService:
    """Generates time-limited signed GET URLs for S3 objects."""

    def __init__(self):
        self.client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME,
        )
        self.bucket = settings.AWS_STORAGE_BUCKET_NAME
        self.expiry = settings.AWS_QUERYSTRING_EXPIRE

    def generate_url(self, object_key: str | None) -> str | None:
        if not object_key or not self.bucket:
            return None
        try:
            return self.client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket, 'Key': object_key},
                ExpiresIn=self.expiry,
            )
        except ClientError:
            return None
