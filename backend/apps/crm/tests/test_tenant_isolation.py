import pytest
from django.urls import reverse
from rest_framework import status
from apps.organizations.models import Organization
from apps.users.models import User
from apps.crm.models import Company

@pytest.mark.django_db
class TestTenantIsolation:
    def setup_method(self):
        # Create Org 1 and users
        self.org1 = Organization.objects.create(name="Org 1", subscription_plan="basic")
        self.admin1 = User.objects.create_user(
            email="admin1@org1.com", password="password123", 
            organization=self.org1, role="admin"
        )
        self.staff1 = User.objects.create_user(
            email="staff1@org1.com", password="password123", 
            organization=self.org1, role="staff"
        )
        self.company1 = Company.objects.create(name="Company 1", organization=self.org1)

        # Create Org 2 and users
        self.org2 = Organization.objects.create(name="Org 2", subscription_plan="pro")
        self.admin2 = User.objects.create_user(
            email="admin2@org2.com", password="password123", 
            organization=self.org2, role="admin"
        )
        self.company2 = Company.objects.create(name="Company 2", organization=self.org2)

    def test_user_cannot_see_other_org_companies(self, client):
        client.force_authenticate(user=self.admin1)
        url = reverse('company-list')
        response = client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        # APIClient might not trigger the custom APIRenderer wrap at response.data
        data = response.data.get('data', response.data)
        ids = [item['id'] for item in data['results']]
        assert str(self.company1.id) in ids
        assert str(self.company2.id) not in ids

    def test_user_cannot_access_other_org_company_detail(self, client):
        client.force_authenticate(user=self.admin1)
        url = reverse('company-detail', kwargs={'pk': self.company2.id})
        response = client.get(url)
        
        # TenantQuerysetMixin filters .all() -> get() will raise 404 for other orgs
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_rbac_admin_can_delete(self, client):
        client.force_authenticate(user=self.admin1)
        url = reverse('company-detail', kwargs={'pk': self.company1.id})
        response = client.delete(url)
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        self.company1.refresh_from_db()
        assert self.company1.is_deleted is True

    def test_rbac_staff_cannot_delete(self, client):
        client.force_authenticate(user=self.staff1)
        url = reverse('company-detail', kwargs={'pk': self.company1.id})
        response = client.delete(url)
        
        # Staff role should be forbidden from deleting based on HasCRMWriteAccess
        assert response.status_code == status.HTTP_403_FORBIDDEN
        self.company1.refresh_from_db()
        assert self.company1.is_deleted is False
