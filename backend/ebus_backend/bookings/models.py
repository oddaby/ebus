from django.db import models
from django.conf import settings
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from buses.models import Schedule, Seat

from django.db import models
from buses.models import Schedule, Seat

class Booking(models.Model):
    STATUS_CHOICES = (
        ('confirmed', 'Confirmed'),
        ('pending', 'Pending'),
        ('cancelled', 'Cancelled'),
    )
    
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE, related_name='bookings')
    full_name = models.CharField(max_length=100)
    total_fare = models.DecimalField(max_digits=10, decimal_places=2)
    booking_time = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='confirmed')

    class Meta:
        ordering = ['-booking_time']

    def __str__(self):
        return f"Booking #{self.id} - {self.full_name}"

class BookedSeat(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='seats')
    seat = models.ForeignKey(Seat, on_delete=models.CASCADE, related_name='bookings')
    passenger_name = models.CharField(max_length=100)
    passenger_age = models.PositiveIntegerField()
    passenger_gender = models.CharField(max_length=10)

    class Meta:
        unique_together = ('seat', 'booking')

    def __str__(self):
        return f"{self.seat.seat_number} - {self.passenger_name}"

@receiver(models.signals.post_save, sender=BookedSeat)
def update_seat_availability(sender, instance, created, **kwargs):
    if created:
        instance.seat.is_available = False
        instance.seat.save()

@receiver(models.signals.pre_delete, sender=BookedSeat)
def release_seat(sender, instance, **kwargs):
    instance.seat.is_available = True
    instance.seat.save()