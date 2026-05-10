from datetime import time, timedelta

from django.conf import settings
from django.utils import timezone

DEFAULT_WORKDAY_WEEKDAYS = (6, 0, 1, 2, 3)
DEFAULT_BOOKING_WINDOW_DAYS = 14
MEETING_DAY_START = time(hour=9, minute=0)
MEETING_DAY_END = time(hour=17, minute=0)


def get_meeting_workday_weekdays():
    configured = getattr(
        settings,
        "MEETING_WORKDAY_WEEKDAYS",
        DEFAULT_WORKDAY_WEEKDAYS,
    )
    return tuple(int(value) for value in configured)


def get_meeting_booking_window_days():
    configured = getattr(
        settings,
        "MEETING_BOOKING_WINDOW_DAYS",
        DEFAULT_BOOKING_WINDOW_DAYS,
    )
    return int(configured)


def get_booking_window_end_date():
    return timezone.localdate() + timedelta(days=get_meeting_booking_window_days())


def is_meeting_workday(value):
    return value.weekday() in get_meeting_workday_weekdays()
