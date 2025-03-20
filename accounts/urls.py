from django.urls import path
from .views import TenantLoginView
from . import views

app_name = 'accounts'

urlpatterns = [
    # Changed from '' to 'login/'
    path('login/', TenantLoginView.as_view(), name='tenant_login'),
    path('tenant-index/', views.tenant_index, name='tenant_index'),
    path('logout/', views.logout_view, name='logout'),
]
