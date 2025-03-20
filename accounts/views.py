from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import LoginView
from django.contrib.auth import logout
from django.conf import settings

class TenantLoginView(LoginView):
    template_name = 'landing.html'  # Login form

    def get_success_url(self):
        return "/"  # Redirects to the home page after login

def logout_view(request):
    logout(request)
    return redirect('/')  # Goes back to the map root

@login_required
def tenant_index(request):
    if request.user.is_superuser:
        return redirect('/admin/')
    tenant = getattr(request, 'tenant', None)
    return render(request, 'tenant_index.html', {'user': request.user, 'tenant': tenant})
