from django.db import models

# Health center model
class HealthCenter(models.Model):
    name = models.CharField(max_length=250)
    latitude = models.FloatField()
    longitude = models.FloatField()

    def __str__(self):
        return self.name

# Zone model
class Zone(models.Model):
    zone_id = models.AutoField(primary_key=True)
    coordinates = models.TextField()  # JSON geometry
    description = models.TextField(null=True, blank=True)
    image = models.ImageField(upload_to='zone_images/', null=True, blank=True)
    highlight_stat = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return f"Zone {self.zone_id}"

    def get_image_url(self):
        """Returns the correct URL for the uploaded image."""
        if self.image:
            return self.image.url
        return ""  # Return empty string if no image

# Hotspot model
class Hotspot(models.Model):
    hotspot_id = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()

    def __str__(self):
        return f"{self.name} ({self.hotspot_id})"

# Story model for the interactive map
class Story(models.Model):
    health_center = models.ForeignKey(
        HealthCenter, on_delete=models.CASCADE, related_name="stories"
    )
    title = models.CharField(max_length=255)
    content = models.TextField()
    author = models.CharField(max_length=100)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Story by {self.author} at {self.health_center.name}"

    def to_dict(self):
        return {
            "title": self.title,
            "content": self.content,
            "author": self.author,
            "timestamp": self.timestamp.strftime('%Y-%m-%d %H:%M:%S')
        }
