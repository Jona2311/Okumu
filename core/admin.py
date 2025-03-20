from django.contrib import admin
from .models import HealthCenter, Zone, Hotspot, Story

@admin.register(HealthCenter)
class HealthCenterAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'latitude', 'longitude')
    search_fields = ('name',)

@admin.register(Zone)
class ZoneAdmin(admin.ModelAdmin):
    list_display = ('zone_id', 'description', 'highlight_stat', 'image_preview')
    search_fields = ('description',)

    def image_preview(self, obj):
        if obj.image:
            return f'<img src="{obj.image.url}" width="100" height="60" />'
        return "No Image"
    
    image_preview.allow_tags = True
    image_preview.short_description = "Image Preview"

@admin.register(Hotspot)
class HotspotAdmin(admin.ModelAdmin):
    list_display = ('hotspot_id', 'name', 'latitude', 'longitude')
    search_fields = ('hotspot_id', 'name')

@admin.register(Story)
class StoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'health_center', 'title', 'author', 'timestamp')
    search_fields = ('title', 'author')
