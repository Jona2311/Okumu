from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from core.models import HealthCenter, Zone, Hotspot, Story
from django.views.decorators.csrf import csrf_exempt
import json
from geopy.distance import geodesic
import uuid
from django.contrib.auth.decorators import login_required

def index(request):
    # same logic: load your health_centers, zones, hotspots
    health_centers = list(HealthCenter.objects.values('id', 'name', 'latitude', 'longitude')[:100])
    zones_qs = Zone.objects.all()
    zones = []
    for z in zones_qs:
        zone_data = {
            'zone_id': z.zone_id,
            'coordinates': json.loads(z.coordinates),
            'description': z.description if z.description else "No description available",
            'image_url': z.get_image_url(),
            'highlight_stat': z.highlight_stat if z.highlight_stat is not None else 0
        }
        zones.append(zone_data)

    hotspots = list(Hotspot.objects.values('name', 'latitude', 'longitude'))

    # attach stories
    for center in health_centers:
        center_obj = HealthCenter.objects.get(id=center["id"])
        center["stories"] = [story.to_dict() for story in center_obj.stories.all()]

    context = {
        'health_centers': health_centers,
        'zones': zones,
        'hotspots': hotspots
    }
    return render(request, 'index.html', context)


@csrf_exempt
def add_story(request):
    # Only allow logged-in users
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Please login to do this'}, status=403)

    if request.method == 'POST':
        data = json.loads(request.body)
        health_center = get_object_or_404(HealthCenter, id=data['health_center_id'])
        story = Story.objects.create(
            health_center=health_center,
            title=data['title'],
            content=data['content'],
            author=data['author']
        )
        return JsonResponse({'message': 'Story added successfully', 'story': story.to_dict()}, status=201)
    return JsonResponse({'error': 'Invalid request'}, status=400)


def health_center_detail(request, pk):
    health_center = get_object_or_404(HealthCenter, pk=pk)
    stories = health_center.stories.all()
    return JsonResponse({'stories': [story.to_dict() for story in stories]})


def nearest_healthcenter(request):
    latitude = request.GET.get('latitude')
    longitude = request.GET.get('longitude')
    if not latitude or not longitude:
        return JsonResponse({'error': 'Invalid coordinates'}, status=400)

    user_location = (float(latitude), float(longitude))
    center_distances = {}
    for center in HealthCenter.objects.all()[:100]:
        center_location = (center.latitude, center.longitude)
        distance = geodesic(user_location, center_location).km
        center_distances[distance] = {'name': center.name, 'coordinates': center_location}

    min_distance = min(center_distances)
    nearest_center = center_distances[min_distance]
    return JsonResponse({
        'name': nearest_center['name'],
        'coordinates': nearest_center['coordinates'],
        'distance': round(min_distance, 2)
    })


@csrf_exempt
def add_hotspot(request):
    # Only allow logged-in users
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Please login to do this'}, status=403)

    if request.method == 'POST':
        data = json.loads(request.body)
        hotspot_id = data.get('hotspot_id') or uuid.uuid4().hex
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        if latitude is None or longitude is None:
            return JsonResponse({'error': 'Latitude and longitude are required.'}, status=400)
        name = data.get('name', 'Reported Hotspot')
        hotspot = Hotspot.objects.create(
            hotspot_id=hotspot_id,
            name=name,
            latitude=latitude,
            longitude=longitude
        )
        return JsonResponse({
            'message': 'Hotspot added successfully',
            'hotspot': {
                'hotspot_id': hotspot.hotspot_id,
                'name': hotspot.name,
                'latitude': hotspot.latitude,
                'longitude': hotspot.longitude
            }
        }, status=201)
    return JsonResponse({'error': 'Invalid request'}, status=400)


@csrf_exempt
def add_health_center(request):
    # Only allow logged-in users
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Please login to do this'}, status=403)

    if request.method == 'POST':
        data = json.loads(request.body)
        name = data.get('name')
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        if not name or not latitude or not longitude:
            return JsonResponse({'error': 'Name, latitude, and longitude are required.'}, status=400)
        health_center = HealthCenter.objects.create(
            name=name,
            latitude=latitude,
            longitude=longitude
        )
        return JsonResponse({
            'message': 'Health center added successfully',
            'health_center': {
                'id': health_center.id,
                'name': health_center.name,
                'latitude': health_center.latitude,
                'longitude': health_center.longitude
            }
        }, status=201)
    return JsonResponse({'error': 'Invalid request'}, status=400)













from django.contrib.auth import get_user_model
from django.shortcuts import render, redirect
from django.contrib import messages

User = get_user_model()  # Get the correct user model (TenantUser)

def create_superuser(request):
    if request.method == "POST":
        email = request.POST.get("email")  # Use email instead of username
        name = request.POST.get("name")    # Assuming you use `name` instead of `username`
        password = request.POST.get("password")

        if User.objects.filter(email=email).exists():
            messages.error(request, "Email already exists.")
        else:
            user = User.objects.create_superuser(name=name, email=email, password=password)
            messages.success(request, "Superuser created successfully.")
            return redirect("create_superuser")

    return render(request, "create_superuser.html")


