from django.db import models
from django.conf import settings
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from buses.models import Schedule, Seat

class Booking(models.Model):
    STATUS_CHOICES = (
        ('confirmed', 'Confirmed'),
        ('pending', 'Pending'),
        ('cancelled', 'Cancelled'),
    )
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    schedule = models.ForeignKey(
        Schedule,
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    seats = models.ManyToManyField(
        Seat,
        through='BookingSeat',
        related_name='bookings'
    )
    total_fare = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )
    booking_time = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='confirmed'
    )

    class Meta:
        ordering = ['-booking_time']
        indexes = [
            models.Index(fields=['booking_time']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"Booking #{self.id} - {self.user.email}"

    def save(self, *args, **kwargs):
        """Calculate total fare before saving"""
        if not self.total_fare and self.schedule_id:
            self.total_fare = self.schedule.fare * self.seats.count()
        super().save(*args, **kwargs)

class BookingSeat(models.Model):
    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name='booked_seats'
    )
    seat = models.ForeignKey(
        Seat,
        on_delete=models.CASCADE,
        related_name='seat_bookings'
    )
    booked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('booking', 'seat')
        verbose_name = "Booked Seat"
        verbose_name_plural = "Booked Seats"

    def __str__(self):
        return f"{self.seat} - {self.booking}"

class Passenger(models.Model):
    GENDER_CHOICES = (
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
        ('prefer_not', 'Prefer not to say'),
    )

    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name='passengers'
    )
    full_name = models.CharField(max_length=100)
    age = models.PositiveIntegerField()
    gender = models.CharField(
        max_length=10,
        choices=GENDER_CHOICES
    )
    seat = models.OneToOneField(
        BookingSeat,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='passenger'
    )

    class Meta:
        verbose_name = "Passenger"
        verbose_name_plural = "Passengers"
        ordering = ['full_name']

    def __str__(self):
        return f"{self.full_name} - {self.booking}"

@receiver(post_save, sender=Booking)
def update_seat_availability(sender, instance, created, **kwargs):
    """Mark seats as unavailable when booking is created"""
    if created:
        for seat in instance.seats.all():
            seat.is_available = False
            seat.save()

@receiver(pre_delete, sender=Booking)
def release_seats(sender, instance, **kwargs):
    """Release seats when booking is deleted"""
    for seat in instance.seats.all():
        seat.is_available = True
        seat.save()