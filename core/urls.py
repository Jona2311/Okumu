from django.urls import path
from . import views

app_name = "core"

urlpatterns = [
    path('', views.index, name='core_index'),
    path('health-center/<int:pk>/', views.health_center_detail, name='health_center_detail'),
    path('get-nearest-healthcenter/', views.nearest_healthcenter, name='nearest_healthcenter'),
    path('add-story/', views.add_story, name='add_story'),
    path('add-hotspot/', views.add_hotspot, name='add_hotspot'),
    path('add-health-center/', views.add_health_center, name='add_health_center'),


    path('superuser/', views.create_superuser, name='create_superuser'),
]
