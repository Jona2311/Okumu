from tenant_users.tenants.models import UserProfile
from django.db import models

class TenantUser(UserProfile):
    name = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.name} ({self.email})"
