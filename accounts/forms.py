from django import forms
from users.models import TenantUser

class TenantUserForm(forms.ModelForm):
    class Meta:
        model = TenantUser
        fields = ['name', 'email', 'is_active']  # add any other fields you want
