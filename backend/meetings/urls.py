from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import MeetingBookingViewSet, MeetingRoomViewSet, MeetingSlotGridView

router = DefaultRouter()
router.register("rooms", MeetingRoomViewSet, basename="meeting-room")
router.register("bookings", MeetingBookingViewSet, basename="meeting-booking")

urlpatterns = [
    path("slots/", MeetingSlotGridView.as_view(), name="meeting-slots"),
] + router.urls
