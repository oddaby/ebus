from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Booking, BookingSeat, Passenger

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'schedule', 'total_fare', 'status', 'booking_time')
    list_filter = ('status', 'booking_time')
    search_fields = ('user__email', 'schedule__route__origin', 'schedule__route__destination')
    ordering = ('-booking_time',)
    readonly_fields = ('booking_time', 'total_fare')

    fieldsets = (
        ("Booking Details", {
            "fields": ("user", "schedule", "total_fare", "status")
        }),
        ("Timestamps", {
            "fields": ("booking_time",)
        }),
    )

@admin.register(BookingSeat)
class BookingSeatAdmin(admin.ModelAdmin):
    list_display = ('id', 'booking', 'seat', 'booked_at')
    list_filter = ('booked_at',)
    search_fields = ('booking__user__email', 'seat__seat_number')
    ordering = ('-booked_at',)

@admin.register(Passenger)
class PassengerAdmin(admin.ModelAdmin):
    list_display = ('id', 'full_name', 'age', 'gender', 'booking')
    list_filter = ('gender',)
    search_fields = ('full_name', 'booking__user__email')
    ordering = ('full_name',)
