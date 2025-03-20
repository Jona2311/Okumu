from django.contrib import admin
from django.urls import path, include
from core import views as core_views
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

urlpatterns = [
    path('admin/', admin.site.urls),
    # Root now goes to the map/index
    path('', core_views.index, name='home'),
    
    # Keep the core app under /core/ as well
    path('core/', include('core.urls', namespace='core')),

    # Accounts app under /accounts/
    path('accounts/', include('accounts.urls')),

    # Companies still here if needed
    path('companies/', include('companies.urls')),
]

urlpatterns += staticfiles_urlpatterns()