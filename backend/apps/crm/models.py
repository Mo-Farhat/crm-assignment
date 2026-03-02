import uuid
import re
from django.db import models
from django.core.exceptions import ValidationError


class ActiveManager(models.Manager):
    """Default manager that excludes soft-deleted records."""

    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)


class Company(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='companies',
        db_index=True,
    )
    name = models.CharField(max_length=255, db_index=True)
    industry = models.CharField(max_length=100, blank=True, db_index=True)
    country = models.CharField(max_length=100, blank=True, db_index=True)
    logo = models.FileField(upload_to='company-logos/', blank=True, null=True)
    is_deleted = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # active is the default; all_objects gives you soft-deleted ones too
    objects = ActiveManager()
    all_objects = models.Manager()

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'companies'

    def __str__(self):
        return self.name

    def soft_delete(self):
        self.is_deleted = True
        self.save(update_fields=['is_deleted'])


def validate_phone(value):
    if not re.match(r'^\d{8,15}$', value):
        raise ValidationError('Phone must be 8–15 digits, numbers only.')


class Contact(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='contacts',
        db_index=True,
    )
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='contacts',
        db_index=True,
    )
    full_name = models.CharField(max_length=255)
    email = models.EmailField(db_index=True)
    phone = models.CharField(max_length=15, blank=True, validators=[validate_phone])
    role = models.CharField(max_length=100, blank=True)
    is_deleted = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = ActiveManager()
    all_objects = models.Manager()

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['email', 'company'],
                condition=models.Q(is_deleted=False),
                name='unique_email_per_company',
            )
        ]

    def __str__(self):
        return f'{self.full_name} ({self.email})'

    def soft_delete(self):
        self.is_deleted = True
        self.save(update_fields=['is_deleted'])
