from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import LoginView
from django.contrib.auth import logout
from django.conf import settings

class TenantLoginView(LoginView):
    template_name = 'landing.html'  # login form

    def get_success_url(self):
        user = self.request.user
        # logic for tenant domain omitted, unchanged
        tenant = user.tenants.exclude(schema_name="public").first()
        if tenant:
            domain_obj = tenant.domains.filter(is_primary=True).first()
            if domain_obj:
                if settings.DEBUG:
                    return f"http://{domain_obj.domain}:8000/"
                else:
                    return f"http://{domain_obj.domain}/"
        # Default fallback now goes to root ('/') which shows the map
        return "/"

def logout_view(request):
    logout(request)
    return redirect('/')  # Goes back to the map root

@login_required
def tenant_index(request):
    if request.user.is_superuser:
        return redirect('/admin/')
    tenant = getattr(request, 'tenant', None)
    return render(request, 'tenant_index.html', {'user': request.user, 'tenant': tenant})
