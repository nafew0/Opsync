from datetime import date, time, timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone
from django.test import TestCase, override_settings
from rest_framework import status
from rest_framework.test import APIClient

from core.models import AuditLog, Notification

from .models import MeetingBooking, MeetingRoom
from .policies import get_meeting_workday_weekdays

User = get_user_model()


@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
)
class MeetingRoomApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="employee",
            email="employee@example.com",
            password="TestPass123!",
            email_verified=True,
            designation="Programme Officer",
        )
        self.system_admin = User.objects.create_user(
            username="sysadmin",
            email="sysadmin@example.com",
            password="TestPass123!",
            email_verified=True,
            opsync_role="system_admin",
            designation="System Administrator",
        )
        self.board_room = MeetingRoom.objects.get(name="Board Room")
        self.admin_officer = User.objects.create_user(
            username="adminofficer",
            email="adminofficer@example.com",
            password="TestPass123!",
            email_verified=True,
            opsync_role="admin_officer",
            designation="Admin Officer",
        )
        self.other_user = User.objects.create_user(
            username="otheruser",
            email="other@example.com",
            password="TestPass123!",
            email_verified=True,
            designation="Network Engineer",
        )

    def next_allowed_booking_date(self, offset_days=0):
        target = timezone.localdate() + timedelta(days=offset_days)
        allowed_weekdays = set(get_meeting_workday_weekdays())
        while target.weekday() not in allowed_weekdays:
            target += timedelta(days=1)
        return target

    def test_room_list_returns_active_rooms_for_authenticated_users(self):
        second_room = MeetingRoom.objects.create(
            name="Innovation Hub",
            capacity=10,
            equipment=["whiteboard", "screen"],
        )
        MeetingRoom.objects.create(
            name="Archive Room",
            capacity=6,
            equipment=[],
            is_active=False,
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/meetings/rooms/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            [item["name"] for item in response.data], ["Board Room", second_room.name]
        )

    def test_room_list_includes_inactive_rooms_for_system_admins(self):
        MeetingRoom.objects.create(
            name="Archive Room",
            capacity=6,
            equipment=[],
            is_active=False,
        )

        self.client.force_authenticate(user=self.system_admin)
        response = self.client.get("/api/meetings/rooms/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertFalse(response.data[-1]["is_active"])

    def test_system_admin_can_create_room(self):
        self.client.force_authenticate(user=self.system_admin)

        response = self.client.post(
            "/api/meetings/rooms/",
            {
                "name": "Executive Briefing Room",
                "capacity": 14,
                "equipment": ["projector", "video_conferencing"],
                "notes": "Used for partner briefings.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            response.data["equipment"], ["projector", "video_conferencing"]
        )
        self.assertTrue(
            MeetingRoom.objects.filter(
                name="Executive Briefing Room", is_active=True
            ).exists()
        )

    def test_non_admin_cannot_create_room(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            "/api/meetings/rooms/",
            {
                "name": "Unauthorized Room",
                "capacity": 4,
                "equipment": [],
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_room_soft_deactivates_it(self):
        room = MeetingRoom.objects.create(
            name="Training Room", capacity=12, equipment=[]
        )
        self.client.force_authenticate(user=self.system_admin)

        response = self.client.delete(f"/api/meetings/rooms/{room.id}/")

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        room.refresh_from_db()
        self.assertFalse(room.is_active)

    def test_slot_grid_returns_pending_and_approved_bookings_only(self):
        self.client.force_authenticate(user=self.user)

        MeetingBooking.objects.create(
            reference_number="BDREN-MTG-2026-00001",
            requester=self.user,
            room=self.board_room,
            date=date(2026, 5, 11),
            start_time=time(9, 0),
            end_time=time(10, 0),
            title="Network design review",
            attendee_count=8,
            status=MeetingBooking.Status.PENDING,
        )
        MeetingBooking.objects.create(
            reference_number="BDREN-MTG-2026-00002",
            requester=self.system_admin,
            room=self.board_room,
            date=date(2026, 5, 12),
            start_time=time(11, 0),
            end_time=time(12, 0),
            title="Leadership sync",
            attendee_count=6,
            status=MeetingBooking.Status.APPROVED,
        )
        MeetingBooking.objects.create(
            reference_number="BDREN-MTG-2026-00003",
            requester=self.user,
            room=self.board_room,
            date=date(2026, 5, 12),
            start_time=time(13, 0),
            end_time=time(14, 0),
            title="Cancelled room hold",
            attendee_count=4,
            status=MeetingBooking.Status.CANCELLED,
        )

        response = self.client.get(
            "/api/meetings/slots/",
            {
                "room_id": str(self.board_room.id),
                "date_from": "2026-05-11",
                "date_to": "2026-05-13",
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(
            [item["status"] for item in response.data],
            [MeetingBooking.Status.PENDING, MeetingBooking.Status.APPROVED],
        )

    def test_slot_grid_rejects_backwards_date_ranges(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.get(
            "/api/meetings/slots/",
            {
                "room_id": str(self.board_room.id),
                "date_from": "2026-05-14",
                "date_to": "2026-05-11",
            },
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_slot_grid_includes_external_guest_and_detail_visibility_flags(self):
        booking_date = self.next_allowed_booking_date()
        booking = MeetingBooking.objects.create(
            reference_number="BDREN-MTG-2026-00004",
            requester=self.user,
            room=self.board_room,
            date=booking_date,
            start_time=time(9, 0),
            end_time=time(10, 0),
            title="Visitor briefing",
            attendee_count=4,
            has_external_attendees=True,
            status=MeetingBooking.Status.PENDING,
        )

        self.client.force_authenticate(user=self.user)
        own_response = self.client.get(
            "/api/meetings/slots/",
            {
                "room_id": str(self.board_room.id),
                "date_from": booking_date.isoformat(),
                "date_to": booking_date.isoformat(),
            },
        )

        self.assertEqual(own_response.status_code, status.HTTP_200_OK)
        self.assertEqual(own_response.data[0]["id"], str(booking.id))
        self.assertTrue(own_response.data[0]["has_external_attendees"])
        self.assertTrue(own_response.data[0]["can_view_detail"])

        self.client.force_authenticate(user=self.other_user)
        other_response = self.client.get(
            "/api/meetings/slots/",
            {
                "room_id": str(self.board_room.id),
                "date_from": booking_date.isoformat(),
                "date_to": booking_date.isoformat(),
            },
        )

        self.assertEqual(other_response.status_code, status.HTTP_200_OK)
        self.assertFalse(other_response.data[0]["can_view_detail"])

    def test_create_booking_generates_reference_and_notifies_requester_and_reviewers(self):
        booking_date = self.next_allowed_booking_date()
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            "/api/meetings/bookings/",
            {
                "room": str(self.board_room.id),
                "date": booking_date.isoformat(),
                "start_time": "09:00",
                "end_time": "10:00",
                "title": "Working session",
                "description": "Phase 3 walkthrough",
                "attendee_count": 6,
                "has_external_attendees": True,
                "external_attendee_notes": "Guest observer",
                "equipment_requested": ["projector"],
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["reference_number"].startswith("BDREN-MTG-"))
        booking = MeetingBooking.objects.get(pk=response.data["id"])
        self.assertEqual(booking.status, MeetingBooking.Status.PENDING)
        self.assertTrue(
            Notification.objects.filter(
                recipient=self.user,
                reference_number=booking.reference_number,
            ).exists()
        )
        self.assertTrue(
            Notification.objects.filter(
                recipient=self.admin_officer,
                reference_number=booking.reference_number,
            ).exists()
        )
        self.assertTrue(
            AuditLog.objects.filter(
                action="booking_submitted",
                reference_number=booking.reference_number,
            ).exists()
        )

    def test_create_booking_rejects_non_workday(self):
        booking_date = self.next_allowed_booking_date()
        while booking_date.weekday() in set(get_meeting_workday_weekdays()):
            booking_date += timedelta(days=1)

        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            "/api/meetings/bookings/",
            {
                "room": str(self.board_room.id),
                "date": booking_date.isoformat(),
                "start_time": "09:00",
                "end_time": "10:00",
                "title": "Friday request",
                "description": "",
                "attendee_count": 4,
                "has_external_attendees": False,
                "external_attendee_notes": "",
                "equipment_requested": [],
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("date", response.data)

    def test_create_booking_rejects_overlap(self):
        booking_date = self.next_allowed_booking_date()
        MeetingBooking.objects.create(
            reference_number="BDREN-MTG-2026-00010",
            requester=self.user,
            room=self.board_room,
            date=booking_date,
            start_time=time(9, 0),
            end_time=time(10, 0),
            title="Existing booking",
            attendee_count=6,
            status=MeetingBooking.Status.APPROVED,
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            "/api/meetings/bookings/",
            {
                "room": str(self.board_room.id),
                "date": booking_date.isoformat(),
                "start_time": "09:30",
                "end_time": "10:30",
                "title": "Overlap request",
                "description": "",
                "attendee_count": 4,
                "has_external_attendees": False,
                "external_attendee_notes": "",
                "equipment_requested": [],
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("non_field_errors", response.data)

    def test_regular_user_only_sees_own_bookings(self):
        booking_date = self.next_allowed_booking_date()
        own_booking = MeetingBooking.objects.create(
            reference_number="BDREN-MTG-2026-00011",
            requester=self.user,
            room=self.board_room,
            date=booking_date,
            start_time=time(9, 0),
            end_time=time(10, 0),
            title="Own booking",
            attendee_count=6,
            status=MeetingBooking.Status.PENDING,
        )
        MeetingBooking.objects.create(
            reference_number="BDREN-MTG-2026-00012",
            requester=self.system_admin,
            room=self.board_room,
            date=booking_date,
            start_time=time(10, 0),
            end_time=time(11, 0),
            title="Other booking",
            attendee_count=6,
            status=MeetingBooking.Status.PENDING,
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/meetings/bookings/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([item["id"] for item in response.data["results"]], [str(own_booking.id)])

    def test_requester_can_retrieve_own_booking_detail(self):
        booking_date = self.next_allowed_booking_date()
        booking = MeetingBooking.objects.create(
            reference_number="BDREN-MTG-2026-00012A",
            requester=self.user,
            room=self.board_room,
            date=booking_date,
            start_time=time(10, 0),
            end_time=time(11, 0),
            title="Own detail",
            attendee_count=5,
            has_external_attendees=True,
            external_attendee_notes="Vendor guest",
            status=MeetingBooking.Status.PENDING,
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.get(f"/api/meetings/bookings/{booking.id}/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], str(booking.id))
        self.assertTrue(response.data["has_external_attendees"])

    def test_regular_user_cannot_retrieve_other_users_booking_detail(self):
        booking_date = self.next_allowed_booking_date()
        booking = MeetingBooking.objects.create(
            reference_number="BDREN-MTG-2026-00012B",
            requester=self.other_user,
            room=self.board_room,
            date=booking_date,
            start_time=time(11, 0),
            end_time=time(12, 0),
            title="Foreign detail",
            attendee_count=3,
            status=MeetingBooking.Status.PENDING,
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.get(f"/api/meetings/bookings/{booking.id}/")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_admin_officer_can_filter_bookings_with_mine_scope(self):
        booking_date = self.next_allowed_booking_date()
        own_booking = MeetingBooking.objects.create(
            reference_number="BDREN-MTG-2026-00012C",
            requester=self.admin_officer,
            room=self.board_room,
            date=booking_date,
            start_time=time(9, 0),
            end_time=time(10, 0),
            title="Officer own request",
            attendee_count=2,
            status=MeetingBooking.Status.PENDING,
        )
        MeetingBooking.objects.create(
            reference_number="BDREN-MTG-2026-00012D",
            requester=self.user,
            room=self.board_room,
            date=booking_date,
            start_time=time(10, 0),
            end_time=time(11, 0),
            title="Queue request",
            attendee_count=4,
            status=MeetingBooking.Status.PENDING,
        )

        self.client.force_authenticate(user=self.admin_officer)
        response = self.client.get("/api/meetings/bookings/", {"scope": "mine"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([item["id"] for item in response.data["results"]], [str(own_booking.id)])

    def test_booking_summary_returns_counts_and_recent_requests(self):
        booking_date = self.next_allowed_booking_date()
        pending_booking = MeetingBooking.objects.create(
            reference_number="BDREN-MTG-2026-00012E",
            requester=self.user,
            room=self.board_room,
            date=booking_date,
            start_time=time(9, 0),
            end_time=time(10, 0),
            title="Pending own booking",
            attendee_count=2,
            status=MeetingBooking.Status.PENDING,
            has_external_attendees=True,
        )
        approved_booking = MeetingBooking.objects.create(
            reference_number="BDREN-MTG-2026-00012F",
            requester=self.user,
            room=self.board_room,
            date=booking_date,
            start_time=time(10, 0),
            end_time=time(11, 0),
            title="Approved own booking",
            attendee_count=2,
            status=MeetingBooking.Status.APPROVED,
        )
        approved_booking.created_at = timezone.now() - timedelta(days=2)
        approved_booking.save(update_fields=["created_at"])
        approved_booking.refresh_from_db()
        MeetingBooking.objects.create(
            reference_number="BDREN-MTG-2026-00012G",
            requester=self.other_user,
            room=self.board_room,
            date=booking_date,
            start_time=time(11, 0),
            end_time=time(12, 0),
            title="Needs officer action",
            attendee_count=3,
            status=MeetingBooking.Status.PENDING,
        )

        self.client.force_authenticate(user=self.admin_officer)
        response = self.client.get("/api/meetings/bookings/summary/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["my_pending_count"], 0)
        self.assertEqual(response.data["my_open_count"], 0)
        self.assertEqual(response.data["awaiting_my_action_count"], 2)
        self.assertEqual(response.data["approved_this_month_count"], 1)
        self.assertIsNotNone(response.data["avg_approval_time_days"])
        self.assertEqual(response.data["recent_requests"], [])

    def test_admin_officer_can_approve_booking(self):
        booking_date = self.next_allowed_booking_date()
        booking = MeetingBooking.objects.create(
            reference_number="BDREN-MTG-2026-00013",
            requester=self.user,
            room=self.board_room,
            date=booking_date,
            start_time=time(9, 0),
            end_time=time(10, 0),
            title="Pending approval",
            attendee_count=6,
            status=MeetingBooking.Status.PENDING,
        )

        self.client.force_authenticate(user=self.admin_officer)
        response = self.client.post(f"/api/meetings/bookings/{booking.id}/approve/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        booking.refresh_from_db()
        self.assertEqual(booking.status, MeetingBooking.Status.APPROVED)
        self.assertEqual(booking.reviewed_by, self.admin_officer)
        self.assertIsNotNone(booking.reviewed_at)
        self.assertTrue(
            Notification.objects.filter(
                recipient=self.user,
                reference_number=booking.reference_number,
                title="Meeting booking approved",
            ).exists()
        )

    def test_reject_response_includes_reviewer_identity(self):
        booking_date = self.next_allowed_booking_date()
        booking = MeetingBooking.objects.create(
            reference_number="BDREN-MTG-2026-00013A",
            requester=self.user,
            room=self.board_room,
            date=booking_date,
            start_time=time(10, 0),
            end_time=time(11, 0),
            title="Reviewer metadata",
            attendee_count=4,
            status=MeetingBooking.Status.PENDING,
        )

        self.client.force_authenticate(user=self.admin_officer)
        response = self.client.post(
            f"/api/meetings/bookings/{booking.id}/reject/",
            {"admin_comment": "Room already assigned."},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["admin_comment"], "Room already assigned.")
        self.assertEqual(response.data["reviewed_by_name"], self.admin_officer.full_name)
        self.assertEqual(
            response.data["reviewed_by_designation"], self.admin_officer.designation
        )
        self.assertIsNotNone(response.data["reviewed_at"])

    def test_admin_officer_reject_requires_comment(self):
        booking_date = self.next_allowed_booking_date()
        booking = MeetingBooking.objects.create(
            reference_number="BDREN-MTG-2026-00014",
            requester=self.user,
            room=self.board_room,
            date=booking_date,
            start_time=time(9, 0),
            end_time=time(10, 0),
            title="Pending rejection",
            attendee_count=6,
            status=MeetingBooking.Status.PENDING,
        )

        self.client.force_authenticate(user=self.admin_officer)
        response = self.client.post(
            f"/api/meetings/bookings/{booking.id}/reject/",
            {"admin_comment": "   "},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("admin_comment", response.data)

    def test_requester_can_cancel_pending_booking(self):
        booking_date = self.next_allowed_booking_date()
        booking = MeetingBooking.objects.create(
            reference_number="BDREN-MTG-2026-00015",
            requester=self.user,
            room=self.board_room,
            date=booking_date,
            start_time=time(9, 0),
            end_time=time(10, 0),
            title="Cancelable",
            attendee_count=6,
            status=MeetingBooking.Status.PENDING,
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.post(f"/api/meetings/bookings/{booking.id}/cancel/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        booking.refresh_from_db()
        self.assertEqual(booking.status, MeetingBooking.Status.CANCELLED)
