import csv
import json
from django.conf import settings
from django.core.management.base import BaseCommand
from core.models import Zone

class Command(BaseCommand):
    help = 'Load zone data from CSV'

    def handle(self, *args, **kwargs):
        data_file = settings.BASE_DIR / 'data' / 'zones.csv'
        
        with open(data_file, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            records = []

            for row in reader:
                records.append({
                    'zone_id': row['zone_id'],
                    'coordinates': row['coordinates'],  # Storing raw JSON string
                })

        for record in records:
            Zone.objects.get_or_create(
                zone_id=record['zone_id'],
                coordinates=record['coordinates']
            )

        self.stdout.write(self.style.SUCCESS(f'Successfully loaded {len(records)} zones!'))
