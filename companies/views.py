from django.http import HttpResponse
from django_tenants.utils import get_tenant_model
from users.models import TenantUser

def welcome(request):
    # Basic example of tenant detection from your existing snippet
    tenant = get_tenant_model().objects.get(schema_name=request.tenant.schema_name)
    user_email = request.GET.get("email", "admin@domain.com")
    user = TenantUser.objects.filter(email=user_email).first()

    response = f"<h1>Welcome to {tenant.name}</h1>"
    if user:
        if user.is_superuser and tenant.schema_name == "public":
            response += f"<p>You are a Superuser ({user.email}).</p>"
        elif user == tenant.owner:
            response += f"<p>You are the Tenant Owner ({user.email}).</p>"
        else:
            response += f"<p>You belong to tenant: {tenant.name}.</p>"
    return HttpResponse(response)
