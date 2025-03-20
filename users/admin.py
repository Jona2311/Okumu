from django.contrib import admin
from .models import TenantUser

@admin.register(TenantUser)
class TenantUserAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'is_active', 'is_superuser')
    search_fields = ('name', 'email')
