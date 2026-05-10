from django.contrib import admin

from .models import MeetingBooking, MeetingRoom


@admin.register(MeetingRoom)
class MeetingRoomAdmin(admin.ModelAdmin):
    list_display = ("name", "capacity", "is_active", "created_at")
    list_filter = ("is_active",)
    search_fields = ("name",)


@admin.register(MeetingBooking)
class MeetingBookingAdmin(admin.ModelAdmin):
    list_display = (
        "reference_number",
        "title",
        "room",
        "date",
        "start_time",
        "end_time",
        "status",
    )
    list_filter = ("status", "date", "room")
    search_fields = ("reference_number", "title", "requester__username")
