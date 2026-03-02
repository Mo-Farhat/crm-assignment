from django.contrib import admin

from .models import Company, Contact


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['name', 'industry', 'country', 'organization', 'is_deleted', 'created_at']
    list_filter = ['is_deleted', 'industry', 'organization']
    search_fields = ['name']


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'email', 'company', 'organization', 'is_deleted']
    list_filter = ['is_deleted', 'organization']
    search_fields = ['full_name', 'email']
