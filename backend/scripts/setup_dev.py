import os
import django
import sys

# add the project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.organizations.models import Organization
from apps.users.models import User
from apps.crm.models import Company, Contact

def setup():
    print("Starting development setup...")

    # 1. Create Organization
    org, created = Organization.objects.get_or_create(
        name="Default Org",
        defaults={'subscription_plan': 'pro'}
    )
    if created:
        print(f"Created organization: {org.name}")
    else:
        print(f"Organization already exists: {org.name}")

    # 2. Create Admin User
    admin_email = "admin@example.com"
    if not User.objects.filter(email=admin_email).exists():
        admin = User.objects.create_superuser(
            email=admin_email,
            password="adminpassword123",
            first_name="Default",
            last_name="Admin",
            organization=org,
            role='admin'
        )
        print(f"Created admin user: {admin_email} (password: adminpassword123)")
    else:
        print(f"Admin user already exists: {admin_email}")

    # 3. Create a Sample Company
    company, created = Company.objects.get_or_create(
        organization=org,
        name="Acme Corp",
        defaults={'industry': 'Technology', 'country': 'USA'}
    )
    if created:
        print(f"Created sample company: {company.name}")

    # 4. Create a Sample Contact
    contact, created = Contact.objects.get_or_create(
        organization=org,
        company=company,
        email="john@acme.com",
        defaults={'full_name': 'John Doe', 'role': 'CEO'}
    )
    if created:
        print(f"Created sample contact: {contact.full_name}")

    print("Setup complete!")

if __name__ == "__main__":
    setup()
