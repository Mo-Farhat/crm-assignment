from rest_framework import serializers

from .models import Company, Contact
from .models import Company, Contact


class CompanySerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = [
            'id', 'name', 'industry', 'country',
            'logo', 'logo_url', 'is_deleted', 'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'is_deleted', 'logo_url']
        extra_kwargs = {'logo': {'write_only': True, 'required': False}}

    def get_logo_url(self, obj):
        if not obj.logo:
            return None
        try:
            return obj.logo.url
        except Exception:
            return None


class ContactSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)

    class Meta:
        model = Contact
        fields = [
            'id', 'full_name', 'email', 'phone', 'role',
            'company', 'company_name', 'organization', 'is_deleted', 'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'is_deleted', 'organization', 'company_name']
        extra_kwargs = {
            'company': {'required': False},
        }
        validators = [] # Disable auto-validators to avoid KeyError on read-only 'is_deleted'

    def validate_email(self, value):
        # We need the company ID to check uniqueness per company
        company_id = self.initial_data.get('company')
        
        if not company_id and 'view' in self.context:
            company_id = self.context['view'].kwargs.get('company_pk')
            
        if not company_id and self.instance:
            company_id = self.instance.company_id

        if not company_id:
            # Skip validation if we don't have company context; DB will catch any real issues
            return value

        # Check for non-deleted contacts with the same email in the same company
        qs = Contact.objects.filter(email=value, company_id=company_id, is_deleted=False)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
            
        if qs.exists():
            raise serializers.ValidationError('A contact with this email already exists for this company.')
        return value
