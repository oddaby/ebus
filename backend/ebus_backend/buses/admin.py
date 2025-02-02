from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Route, Bus, Schedule, Seat

@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ('origin', 'destination', 'distance', 'estimated_duration')
    search_fields = ('origin', 'destination')
    list_filter = ('origin', 'destination')

@admin.register(Bus)
class BusAdmin(admin.ModelAdmin):
    list_display = ('bus_number', 'bus_type', 'capacity')
    search_fields = ('bus_number',)
    list_filter = ('bus_type',)

@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ('bus', 'route', 'departure_time', 'arrival_time', 'fare')
    search_fields = ('bus__bus_number', 'route__origin', 'route__destination')
    list_filter = ('departure_time', 'arrival_time')

@admin.register(Seat)
class SeatAdmin(admin.ModelAdmin):
    list_display = ('schedule', 'seat_number', 'is_available')
    search_fields = ('schedule__bus__bus_number', 'seat_number')
    list_filter = ('is_available',)
