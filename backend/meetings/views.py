from django.contrib.auth import get_user_model
from django.db.models import Avg, Case, DurationField, ExpressionWrapper, F, IntegerField, Value, When
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.mixins import CreateModelMixin, ListModelMixin, RetrieveModelMixin
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet, ModelViewSet

from core.audit import log_action
from core.notify import send_notification
from core.permissions import IsSystemAdmin
from core.ref import generate_reference

from .access import user_can_manage_rooms, user_can_review_bookings
from .models import MeetingBooking, MeetingRoom
from .serializers import (
    MeetingBookingDetailSerializer,
    MeetingBookingListSerializer,
    MeetingBookingRejectSerializer,
    MeetingBookingWriteSerializer,
    MeetingRoomSerializer,
    MeetingSlotQuerySerializer,
    MeetingSlotSerializer,
)

DEFAULT_MEETING_ROOM_NAME = "Board Room"
User = get_user_model()


def notify_booking_reviewer_users(booking):
    reviewers = User.objects.filter(
        is_active=True,
        is_superuser=True,
    ) | User.objects.filter(
        is_active=True,
        opsync_role__in=["admin_officer", "am_dm", "system_admin"],
    )

    seen_user_ids = set()
    for reviewer in reviewers.distinct():
        if reviewer.pk in seen_user_ids:
            continue
        seen_user_ids.add(reviewer.pk)
        send_notification(
            reviewer,
            title="Meeting booking awaiting review",
            message=(
                f"{booking.reference_number} for {booking.room.name} on "
                f"{booking.date} is waiting for review."
            ),
            module="meetings",
            reference_number=booking.reference_number,
            link=f"/meetings/{booking.id}",
        )


def ensure_booking_status(booking, allowed_statuses):
    return booking.status in allowed_statuses


class MeetingRoomViewSet(ModelViewSet):
    serializer_class = MeetingRoomSerializer
    pagination_class = None

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [IsAuthenticated()]
        return [IsSystemAdmin()]

    def get_queryset(self):
        queryset = MeetingRoom.objects.annotate(
            default_rank=Case(
                When(name__iexact=DEFAULT_MEETING_ROOM_NAME, then=Value(0)),
                default=Value(1),
                output_field=IntegerField(),
            )
        ).order_by("default_rank", "created_at", "name")

        if self.action in ("list", "retrieve") and not user_can_manage_rooms(
            self.request.user
        ):
            queryset = queryset.filter(is_active=True)
        return queryset

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_active = False
        instance.save(update_fields=["is_active"])
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeetingSlotGridView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = MeetingSlotQuerySerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)

        room = get_object_or_404(
            MeetingRoom.objects.filter(is_active=True),
            pk=serializer.validated_data["room_id"],
        )
        bookings = (
            MeetingBooking.objects.select_related("requester")
            .filter(
                room=room,
                date__gte=serializer.validated_data["date_from"],
                date__lte=serializer.validated_data["date_to"],
                status__in=[
                    MeetingBooking.Status.PENDING,
                    MeetingBooking.Status.APPROVED,
                ],
            )
            .order_by("date", "start_time", "created_at")
        )
        return Response(
            MeetingSlotSerializer(
                bookings,
                many=True,
                context={"request": request},
            ).data
        )


class MeetingBookingViewSet(
    CreateModelMixin,
    ListModelMixin,
    RetrieveModelMixin,
    GenericViewSet,
):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "create":
            return MeetingBookingWriteSerializer
        if self.action == "retrieve":
            return MeetingBookingDetailSerializer
        if self.action == "reject":
            return MeetingBookingRejectSerializer
        return MeetingBookingListSerializer

    def get_queryset(self):
        queryset = MeetingBooking.objects.select_related(
            "room",
            "requester",
            "requester__department",
        )

        scope = (self.request.query_params.get("scope") or "").strip().lower()
        if not user_can_review_bookings(self.request.user):
            queryset = queryset.filter(requester=self.request.user)
        elif scope == "mine":
            queryset = queryset.filter(requester=self.request.user)
        elif scope == "review":
            queryset = queryset.exclude(requester=self.request.user)

        status_value = (self.request.query_params.get("status") or "").strip()
        if status_value:
            queryset = queryset.filter(status=status_value)

        date_from = (self.request.query_params.get("date_from") or "").strip()
        if date_from:
            queryset = queryset.filter(date__gte=date_from)

        date_to = (self.request.query_params.get("date_to") or "").strip()
        if date_to:
            queryset = queryset.filter(date__lte=date_to)

        return queryset.order_by("date", "start_time", "created_at")

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated], url_path="summary")
    def summary(self, request):
        base_queryset = MeetingBooking.objects.select_related(
            "room",
            "requester",
            "requester__department",
        )
        own_queryset = base_queryset.filter(requester=request.user)
        today = timezone.localdate()
        month_start = today.replace(day=1)
        review_queryset = base_queryset.none()

        if user_can_review_bookings(request.user):
            review_queryset = base_queryset.exclude(requester=request.user)

        approved_scope = review_queryset if user_can_review_bookings(request.user) else own_queryset
        avg_approval_time = approved_scope.filter(
            status=MeetingBooking.Status.APPROVED
        ).annotate(
            approval_time=ExpressionWrapper(
                F("updated_at") - F("created_at"),
                output_field=DurationField(),
            )
        ).aggregate(value=Avg("approval_time"))["value"]

        recent_requests = own_queryset.order_by("-created_at")[:6]

        return Response(
            {
                "my_pending_count": own_queryset.filter(
                    status=MeetingBooking.Status.PENDING
                ).count(),
                "my_open_count": own_queryset.filter(
                    status__in=[
                        MeetingBooking.Status.PENDING,
                        MeetingBooking.Status.APPROVED,
                    ]
                ).count(),
                "awaiting_my_action_count": review_queryset.filter(
                    status=MeetingBooking.Status.PENDING
                ).count(),
                "approved_this_month_count": approved_scope.filter(
                    status=MeetingBooking.Status.APPROVED,
                    updated_at__date__gte=month_start,
                    updated_at__date__lte=today,
                ).count(),
                "avg_approval_time_days": (
                    round(avg_approval_time.total_seconds() / 86400, 1)
                    if avg_approval_time
                    else None
                ),
                "recent_requests": MeetingBookingListSerializer(
                    recent_requests,
                    many=True,
                ).data,
            }
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        booking = serializer.save(
            requester=request.user,
            reference_number=generate_reference("meetings"),
            status=MeetingBooking.Status.PENDING,
        )

        log_action(
            request.user,
            action="booking_submitted",
            module="meetings",
            reference_number=booking.reference_number,
            previous_status="",
            new_status=booking.status,
            request=request,
        )
        send_notification(
            request.user,
            title="Meeting booking submitted",
            message=(
                f"{booking.reference_number} has been submitted for "
                f"{booking.room.name} on {booking.date}."
            ),
            module="meetings",
            reference_number=booking.reference_number,
            link=f"/meetings/{booking.id}",
        )
        notify_booking_reviewer_users(booking)

        detail_serializer = MeetingBookingDetailSerializer(booking)
        return Response(detail_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated], url_path="approve")
    def approve(self, request, pk=None):
        if not user_can_review_bookings(request.user):
            return Response(status=status.HTTP_403_FORBIDDEN)

        booking = self.get_object()
        if not ensure_booking_status(booking, {MeetingBooking.Status.PENDING}):
            return Response(
                {"detail": "Only pending bookings can be approved."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        previous_status = booking.status
        booking.status = MeetingBooking.Status.APPROVED
        booking.admin_comment = ""
        booking.reviewed_by = request.user
        booking.reviewed_at = timezone.now()
        booking.save(
            update_fields=[
                "status",
                "admin_comment",
                "reviewed_by",
                "reviewed_at",
                "updated_at",
            ]
        )

        log_action(
            request.user,
            action="booking_approved",
            module="meetings",
            reference_number=booking.reference_number,
            previous_status=previous_status,
            new_status=booking.status,
            request=request,
        )
        send_notification(
            booking.requester,
            title="Meeting booking approved",
            message=f"{booking.reference_number} has been approved.",
            module="meetings",
            reference_number=booking.reference_number,
            link=f"/meetings/{booking.id}",
        )
        return Response(MeetingBookingDetailSerializer(booking).data)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated], url_path="reject")
    def reject(self, request, pk=None):
        if not user_can_review_bookings(request.user):
            return Response(status=status.HTTP_403_FORBIDDEN)

        booking = self.get_object()
        if not ensure_booking_status(booking, {MeetingBooking.Status.PENDING}):
            return Response(
                {"detail": "Only pending bookings can be rejected."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        previous_status = booking.status
        booking.status = MeetingBooking.Status.REJECTED
        booking.admin_comment = serializer.validated_data["admin_comment"]
        booking.reviewed_by = request.user
        booking.reviewed_at = timezone.now()
        booking.save(
            update_fields=[
                "status",
                "admin_comment",
                "reviewed_by",
                "reviewed_at",
                "updated_at",
            ]
        )

        log_action(
            request.user,
            action="booking_rejected",
            module="meetings",
            reference_number=booking.reference_number,
            previous_status=previous_status,
            new_status=booking.status,
            comment=booking.admin_comment,
            request=request,
        )
        send_notification(
            booking.requester,
            title="Meeting booking rejected",
            message=(
                f"{booking.reference_number} was rejected. "
                f"Comment: {booking.admin_comment}"
            ),
            module="meetings",
            reference_number=booking.reference_number,
            link=f"/meetings/{booking.id}",
        )
        return Response(MeetingBookingDetailSerializer(booking).data)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated], url_path="cancel")
    def cancel(self, request, pk=None):
        booking = self.get_object()
        if booking.requester_id != request.user.id:
            return Response(status=status.HTTP_403_FORBIDDEN)
        if booking.status != MeetingBooking.Status.PENDING:
            return Response(
                {"detail": "Only pending bookings can be cancelled."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        previous_status = booking.status
        booking.status = MeetingBooking.Status.CANCELLED
        booking.save(update_fields=["status", "updated_at"])

        log_action(
            request.user,
            action="booking_cancelled",
            module="meetings",
            reference_number=booking.reference_number,
            previous_status=previous_status,
            new_status=booking.status,
            request=request,
        )
        send_notification(
            booking.requester,
            title="Meeting booking cancelled",
            message=f"{booking.reference_number} has been cancelled.",
            module="meetings",
            reference_number=booking.reference_number,
            link=f"/meetings/{booking.id}",
        )
        return Response(MeetingBookingDetailSerializer(booking).data)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[IsAuthenticated],
        url_path="no-show",
    )
    def no_show(self, request, pk=None):
        if not user_can_review_bookings(request.user):
            return Response(status=status.HTTP_403_FORBIDDEN)

        booking = self.get_object()
        if not ensure_booking_status(booking, {MeetingBooking.Status.APPROVED}):
            return Response(
                {"detail": "Only approved bookings can be marked as no-show."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        previous_status = booking.status
        booking.status = MeetingBooking.Status.NO_SHOW
        booking.reviewed_by = request.user
        booking.reviewed_at = timezone.now()
        booking.save(
            update_fields=["status", "reviewed_by", "reviewed_at", "updated_at"]
        )

        log_action(
            request.user,
            action="booking_no_show",
            module="meetings",
            reference_number=booking.reference_number,
            previous_status=previous_status,
            new_status=booking.status,
            request=request,
        )
        send_notification(
            booking.requester,
            title="Meeting booking marked as no-show",
            message=f"{booking.reference_number} was marked as no-show.",
            module="meetings",
            reference_number=booking.reference_number,
            link=f"/meetings/{booking.id}",
        )
        return Response(MeetingBookingDetailSerializer(booking).data)
