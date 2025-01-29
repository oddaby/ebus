from django.db import models
from django.core.exceptions import ValidationError
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings

class Route(models.Model):
    origin = models.CharField(max_length=100)
    destination = models.CharField(max_length=100)
    distance = models.PositiveIntegerField(
        help_text="Distance in miles", 
        null=True, 
        blank=True
    )
    estimated_duration = models.DurationField(
        help_text="HH:MM:SS format"
    )

    class Meta:
        unique_together = ['origin', 'destination']
        ordering = ['origin', 'destination']

    def __str__(self):
        return f"{self.origin} to {self.destination}"

    def save(self, *args, **kwargs):
        self.origin = self.origin.strip().upper()
        self.destination = self.destination.strip().upper()
        super().save(*args, **kwargs)

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

    class Meta:
        verbose_name_plural = "Buses"
        ordering = ['bus_number']

    def __str__(self):
        return f"{self.bus_number} ({self.get_bus_type_display()})"

class Schedule(models.Model):
    route = models.ForeignKey(
        Route, 
        on_delete=models.CASCADE, 
        related_name='schedules'
    )
    bus = models.ForeignKey(
        Bus, 
        on_delete=models.CASCADE,
        related_name='schedules'
    )
    departure_time = models.DateTimeField()
    arrival_time = models.DateTimeField()
    fare = models.DecimalField(
        max_digits=8, 
        decimal_places=2,
        help_text="Base fare per seat"
    )

    class Meta:
        ordering = ['-departure_time']
        indexes = [
            models.Index(fields=['departure_time']),
            models.Index(fields=['arrival_time']),
        ]

    def __str__(self):
        return f"{self.bus} - {self.route} | Dep: {self.departure_time}"

    def clean(self):
        if self.arrival_time <= self.departure_time:
            raise ValidationError("Arrival time must be after departure time.")

class Seat(models.Model):
    schedule = models.ForeignKey(
        Schedule,
        on_delete=models.CASCADE,
        related_name='seats'
    )
    seat_number = models.CharField(max_length=5)
    is_available = models.BooleanField(default=True)

    class Meta:
        unique_together = ['schedule', 'seat_number']
        ordering = ['schedule', 'seat_number']

    def __str__(self):
        return f"Seat {self.seat_number} - {self.schedule}"

@receiver(post_save, sender=Schedule)
def create_seats(sender, instance, created, **kwargs):
    """Automatically create seats when a new schedule is created"""
    if created:
        Seat.objects.bulk_create([
            Seat(
                schedule=instance,
                seat_number=str(seat_num),
                is_available=True
            )
            for seat_num in range(1, instance.bus.capacity + 1)
        ])