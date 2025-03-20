import csv
from django.conf import settings
from django.core.management.base import BaseCommand
from core.models import HealthCenter

class Command(BaseCommand):
    help = 'Load health center data from CSV'

    def handle(self, *args, **kwargs):
        data_file = settings.BASE_DIR / 'data' / 'healthcenters.csv'
        keys = ('name', 'longitude', 'latitude')  # CSV columns to use
        
        records = []
        with open(data_file, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                if row['name'] and row['longitude'] and row['latitude']:  # Ensure valid data
                    records.append({
                        'name': row['name'],
                        'longitude': float(row['longitude']),
                        'latitude': float(row['latitude']),
                    })

        for record in records:
            HealthCenter.objects.get_or_create(
                name=record['name'],
                latitude=record['latitude'],
                longitude=record['longitude']
            )

        self.stdout.write(self.style.SUCCESS(f'Successfully loaded {len(records)} health centers!'))
