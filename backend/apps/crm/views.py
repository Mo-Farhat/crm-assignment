from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from apps.core.mixins import TenantQuerysetMixin
from apps.activity.services import ActivityService
from apps.activity.models import ActivityLog
from permissions.rbac import HasCRMWriteAccess, IsOrganizationMember
from .models import Company, Contact
from .serializers import CompanySerializer, ContactSerializer
from .filters import CompanyFilter, ContactFilter


class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        org = user.organization
        
        if not org:
            return Response({"success": False, "message": "User has no organization"}, status=400)

        company_count = Company.objects.filter(organization=org, is_deleted=False).count()
        contact_count = Contact.objects.filter(organization=org, is_deleted=False).count()
        recent_activity = ActivityLog.objects.filter(organization=org).order_by('-timestamp')[:5]
        
        # We can expand this later
        return Response({
            "success": True,
            "data": {
                "company_count": company_count,
                "contact_count": contact_count,
                "recent_activity_count": ActivityLog.objects.filter(organization=org).count()
            }
        })


class CompanyViewSet(TenantQuerysetMixin, viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [permissions.IsAuthenticated, HasCRMWriteAccess]
    filterset_class = CompanyFilter
    search_fields = ['name', 'industry']
    ordering_fields = ['name', 'created_at']
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)

    def perform_create(self, serializer):
        company = serializer.save(organization=self.request.user.organization)
        ActivityService.log(self.request.user, company.organization, 'CREATE', 'Company', company.id)

    def perform_update(self, serializer):
        company = serializer.save()
        ActivityService.log(self.request.user, company.organization, 'UPDATE', 'Company', company.id)

    def perform_destroy(self, instance):
        # soft delete — row stays in the database for audit purposes
        instance.soft_delete()
        ActivityService.log(self.request.user, instance.organization, 'DELETE', 'Company', instance.id)


class ContactViewSet(TenantQuerysetMixin, viewsets.ModelViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    permission_classes = [permissions.IsAuthenticated, HasCRMWriteAccess, IsOrganizationMember]
    filterset_class = ContactFilter
    search_fields = ['full_name', 'email']
    ordering_fields = ['full_name', 'created_at']

    def get_queryset(self):
        qs = super().get_queryset().filter(is_deleted=False)
        company_pk = self.kwargs.get('company_pk')
        if company_pk:
            qs = qs.filter(company_id=company_pk)
        return qs

    def perform_create(self, serializer):
        company_pk = self.kwargs.get('company_pk')
        save_kwargs = {'organization': self.request.user.organization}
        if company_pk:
            save_kwargs['company_id'] = company_pk

        contact = serializer.save(**save_kwargs)
        ActivityService.log(self.request.user, contact.organization, 'CREATE', 'Contact', contact.id)

    def perform_update(self, serializer):
        contact = serializer.save()
        ActivityService.log(self.request.user, contact.organization, 'UPDATE', 'Contact', contact.id)

    def perform_destroy(self, instance):
        instance.soft_delete()
        ActivityService.log(self.request.user, instance.organization, 'DELETE', 'Contact', instance.id)
