from django.db import models

# Create your models here.

class Route(models.Model):
    origin = models.CharField(max_length=100)
    destination = models.CharField(max_length=100)
    base_fare = models.DecimalField(max_digits=6, decimal_places=2)
    distance = models.PositiveIntegerField(help_text="Distance in miles", null=True, blank=True)
    estimated_duration = models.DurationField(help_text="HH:MM:SS format")

    class Meta:
        unique_together = ['origin', 'destination']

    def __str__(self):
        return f"{self.origin} to {self.destination} - ${self.base_fare}"

class Bus(models.Model):
    BUS_TYPES = (
        ('standard', 'Standard'),
        ('luxury', 'Luxury'),
        ('sleeper', 'Sleeper'),
    )
    
    bus_number = models.CharField(max_length=50, unique=True)
    bus_type = models.CharField(max_length=20, choices=BUS_TYPES)
    capacity = models.PositiveIntegerField()
    amenities = models.TextField(blank=True)

    def __str__(self):
        return f"{self.bus_number} ({self.get_bus_type_display()})"

class Schedule(models.Model):
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name='schedules')
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE)
    departure_time = models.DateTimeField()
    arrival_time = models.DateTimeField()
    available_seats = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.bus} - {self.route} | Dep: {self.departure_time}"

class Seat(models.Model):
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE, related_name='seats')
    seat_number = models.CharField(max_length=5)
    is_available = models.BooleanField(default=True)

    class Meta:
        unique_together = ['schedule', 'seat_number']

    def __str__(self):
        return f"Seat {self.seat_number} - {self.schedule}"