import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

from .policies import (
    MEETING_DAY_END,
    MEETING_DAY_START,
    get_booking_window_end_date,
    is_meeting_workday,
)


EQUIPMENT_CHOICES = [
    ("projector", "Projector"),
    ("whiteboard", "Whiteboard"),
    ("video_conferencing", "Video Conferencing"),
    ("screen", "Display Screen"),
    ("sound_system", "Sound System"),
]


class MeetingRoom(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    capacity = models.PositiveIntegerField()
    equipment = models.JSONField(default=list, blank=True)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at", "name"]

    def __str__(self):
        return self.name


class MeetingBooking(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"
        CANCELLED = "cancelled", "Cancelled"
        NO_SHOW = "no_show", "No Show"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reference_number = models.CharField(max_length=30, unique=True)
    requester = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="meeting_bookings",
    )
    room = models.ForeignKey(
        MeetingRoom,
        on_delete=models.CASCADE,
        related_name="bookings",
    )
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    attendee_count = models.PositiveIntegerField()
    has_external_attendees = models.BooleanField(default=False)
    external_attendee_notes = models.TextField(blank=True)
    equipment_requested = models.JSONField(default=list, blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    admin_comment = models.TextField(blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="reviewed_meeting_bookings",
        null=True,
        blank=True,
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["date", "start_time", "created_at"]
        indexes = [
            models.Index(fields=["room", "date", "status"]),
            models.Index(fields=["requester", "date"]),
        ]

    def __str__(self):
        return f"{self.reference_number} — {self.title}"

    def clean(self):
        errors = {}

        if self.start_time and self.start_time.minute not in (0, 30):
            errors["start_time"] = "Start time must be on a 30-minute boundary."

        if self.end_time and self.end_time.minute not in (0, 30):
            errors["end_time"] = "End time must be on a 30-minute boundary."

        if self.start_time and self.start_time < MEETING_DAY_START:
            errors["start_time"] = "Start time must be within meeting hours."

        if self.end_time and self.end_time > MEETING_DAY_END:
            errors["end_time"] = "End time must be within meeting hours."

        if self.start_time and self.end_time and self.end_time <= self.start_time:
            errors["end_time"] = "End time must be after start time."

        if self.date:
            if self.date < timezone.localdate():
                errors["date"] = "Bookings must be for today or a future workday."
            if not is_meeting_workday(self.date):
                errors["date"] = "Bookings are allowed on workdays only."
            elif self.date > get_booking_window_end_date():
                errors["date"] = "Bookings must be within the next 14 calendar days."

        if self.room_id and self.date and self.start_time and self.end_time:
            overlap_exists = (
                MeetingBooking.objects.filter(
                    room_id=self.room_id,
                    date=self.date,
                    status__in=[self.Status.PENDING, self.Status.APPROVED],
                )
                .exclude(pk=self.pk)
                .filter(
                    start_time__lt=self.end_time,
                    end_time__gt=self.start_time,
                )
                .exists()
            )
            if overlap_exists:
                errors["non_field_errors"] = [
                    "This room already has a pending or approved booking in that time range."
                ]

        if errors:
            raise ValidationError(errors)
