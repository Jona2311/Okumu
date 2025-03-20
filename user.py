#create public tenant
from tenant_users.tenants.utils import create_public_tenant

public_tenant, public_domain, public_owner = create_public_tenant(
    domain_url="127.0.0.1",      # or your local domain
    owner_email="admin@domain.com"
)
print("Public tenant created:", public_tenant)















#Create a New Tenant with an Owner
from companies.models import Company, Domain
from django.contrib.auth import get_user_model
from django_tenants.utils import schema_exists

User = get_user_model()

# Get the owner (superuser) from the public schema
owner = User.objects.get(email="admin@domain.com")

# Create the tenant (Company) with an owner
tenant = Company.objects.create(
    schema_name="tenant1",# Must be unique and lowercase
    name="Tenant 1",
    description="This is Tenant 1",
    owner=owner # Assign the owner user here
)

# Create a domain for the tenant
domain = Domain.objects.create(
    domain="tenant1.localhost",# Must match your local development setup
    tenant=tenant,
    is_primary=True
)

print("Tenant created:", tenant)
print("Domain created:", domain)
print("Schema exists:", schema_exists("tenant1"))
















#Create a Tenant User (in Public Schema)
tenant_user = User.objects.create_user(
    email="user@tenant1.com",
    password="password123",
    name="Tenant User 1"
)
print("Tenant user created:", tenant_user)















#Associate the Tenant User with the New Tenant
# In the Django shell
tenant.add_user(tenant_user)
print(f"User {tenant_user.email} added to tenant {tenant.name}")
