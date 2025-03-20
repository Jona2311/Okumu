from django.db import models
from tenant_users.tenants.models import TenantBase
from django_tenants.models import DomainMixin

class Company(TenantBase):
    name = models.CharField(max_length=100)
    description = models.TextField(max_length=200, blank=True)
    created_on = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Domain(DomainMixin):
    pass
