from django.contrib import admin
from .models import Organization


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ['name', 'subscription_plan', 'created_at']
    search_fields = ['name']
    list_filter = ['subscription_plan']
