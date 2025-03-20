import csv
from django.conf import settings
from django.core.management.base import BaseCommand
from core.models import Hotspot  # Use the updated Hotspot model

class Command(BaseCommand):
    help = 'Load hotspot data from CSV'

    def handle(self, *args, **kwargs):
        data_file = settings.BASE_DIR / 'data' / 'hotspots.csv'

        records = []
        with open(data_file, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                if row['id'] and row['lat'] and row['lon']:  # Ensure valid data
                    records.append({
                        'hotspot_id': row['id'],
                        'name': row['name'] if row['name'] else "Unknown",
                        'latitude': float(row['lat']),
                        'longitude': float(row['lon']),
                    })

        for record in records:
            Hotspot.objects.get_or_create(
                hotspot_id=record['hotspot_id'],
                defaults={
                    'name': record['name'],
                    'latitude': record['latitude'],
                    'longitude': record['longitude'],
                }
            )

        self.stdout.write(self.style.SUCCESS(f'Successfully loaded {len(records)} hotspots!'))
