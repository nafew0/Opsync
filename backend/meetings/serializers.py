from rest_framework import serializers

from .access import user_can_view_booking
from .models import EQUIPMENT_CHOICES, MeetingBooking, MeetingRoom

EQUIPMENT_VALUES = {value for value, _label in EQUIPMENT_CHOICES}
EQUIPMENT_LABELS = dict(EQUIPMENT_CHOICES)


class MeetingRoomSerializer(serializers.ModelSerializer):
    equipment_labels = serializers.SerializerMethodField()

    class Meta:
        model = MeetingRoom
        fields = [
            "id",
            "name",
            "capacity",
            "equipment",
            "equipment_labels",
            "notes",
            "is_active",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def get_equipment_labels(self, obj):
        return [EQUIPMENT_LABELS.get(value, value) for value in obj.equipment]

    def validate_name(self, value):
        normalized = " ".join((value or "").split()).strip()
        if not normalized:
            raise serializers.ValidationError("Room name is required.")
        return normalized

    def validate_equipment(self, value):
        if value in (None, ""):
            return []
        if not isinstance(value, list):
            raise serializers.ValidationError("Equipment must be a list of values.")

        normalized = []
        for item in value:
            if item not in EQUIPMENT_VALUES:
                raise serializers.ValidationError(
                    f"Unsupported equipment value: {item}"
                )
            if item not in normalized:
                normalized.append(item)
        return normalized


class MeetingSlotQuerySerializer(serializers.Serializer):
    room_id = serializers.UUIDField()
    date_from = serializers.DateField()
    date_to = serializers.DateField()

    def validate(self, attrs):
        if attrs["date_to"] < attrs["date_from"]:
            raise serializers.ValidationError(
                {"date_to": "date_to must be on or after date_from."}
            )
        return attrs


class MeetingSlotSerializer(serializers.ModelSerializer):
    room_id = serializers.UUIDField(read_only=True)
    requester_name = serializers.CharField(
        source="requester.full_name",
        read_only=True,
        default="",
    )
    has_external_attendees = serializers.BooleanField(read_only=True)
    can_view_detail = serializers.SerializerMethodField()

    class Meta:
        model = MeetingBooking
        fields = [
            "id",
            "room_id",
            "date",
            "start_time",
            "end_time",
            "title",
            "requester_name",
            "has_external_attendees",
            "can_view_detail",
            "status",
        ]
        read_only_fields = fields

    def get_can_view_detail(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        return user_can_view_booking(user, obj)


class MeetingBookingListSerializer(serializers.ModelSerializer):
    room_id = serializers.UUIDField(read_only=True)
    room_name = serializers.CharField(source="room.name", read_only=True)
    requester_name = serializers.CharField(
        source="requester.full_name",
        read_only=True,
        default="",
    )
    has_external_attendees = serializers.BooleanField(read_only=True)

    class Meta:
        model = MeetingBooking
        fields = [
            "id",
            "reference_number",
            "room_id",
            "room_name",
            "date",
            "start_time",
            "end_time",
            "title",
            "requester_name",
            "has_external_attendees",
            "status",
            "created_at",
        ]
        read_only_fields = fields


class MeetingBookingDetailSerializer(serializers.ModelSerializer):
    room_id = serializers.UUIDField(read_only=True)
    room_name = serializers.CharField(source="room.name", read_only=True)
    room_capacity = serializers.IntegerField(source="room.capacity", read_only=True)
    room_equipment_labels = serializers.SerializerMethodField()
    requester_id = serializers.UUIDField(source="requester.id", read_only=True)
    requester_name = serializers.CharField(
        source="requester.full_name",
        read_only=True,
        default="",
    )
    requester_email = serializers.CharField(source="requester.email", read_only=True)
    requester_department_name = serializers.CharField(
        source="requester.department.name",
        read_only=True,
        default="",
    )
    requester_designation = serializers.CharField(
        source="requester.designation",
        read_only=True,
        default="",
    )
    reviewed_at = serializers.DateTimeField(read_only=True)
    reviewed_by_name = serializers.CharField(
        source="reviewed_by.full_name",
        read_only=True,
        default="",
    )
    reviewed_by_designation = serializers.CharField(
        source="reviewed_by.designation",
        read_only=True,
        default="",
    )
    equipment_requested_labels = serializers.SerializerMethodField()

    class Meta:
        model = MeetingBooking
        fields = [
            "id",
            "reference_number",
            "room_id",
            "room_name",
            "room_capacity",
            "room_equipment_labels",
            "date",
            "start_time",
            "end_time",
            "title",
            "description",
            "attendee_count",
            "has_external_attendees",
            "external_attendee_notes",
            "equipment_requested",
            "equipment_requested_labels",
            "status",
            "admin_comment",
            "reviewed_at",
            "created_at",
            "updated_at",
            "requester_id",
            "requester_name",
            "requester_email",
            "requester_department_name",
            "requester_designation",
            "reviewed_by_name",
            "reviewed_by_designation",
        ]
        read_only_fields = fields

    def get_room_equipment_labels(self, obj):
        return [EQUIPMENT_LABELS.get(value, value) for value in obj.room.equipment]

    def get_equipment_requested_labels(self, obj):
        return [EQUIPMENT_LABELS.get(value, value) for value in obj.equipment_requested]


class MeetingBookingWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = MeetingBooking
        fields = [
            "room",
            "date",
            "start_time",
            "end_time",
            "title",
            "description",
            "attendee_count",
            "has_external_attendees",
            "external_attendee_notes",
            "equipment_requested",
        ]

    def validate_room(self, value):
        if not value.is_active:
            raise serializers.ValidationError("This room is not available for booking.")
        return value

    def validate_title(self, value):
        normalized = " ".join((value or "").split()).strip()
        if not normalized:
            raise serializers.ValidationError("Meeting title is required.")
        return normalized

    def validate_equipment_requested(self, value):
        if value in (None, ""):
            return []
        if not isinstance(value, list):
            raise serializers.ValidationError(
                "Equipment requested must be a list of values."
            )

        normalized = []
        for item in value:
            if item not in EQUIPMENT_VALUES:
                raise serializers.ValidationError(
                    f"Unsupported equipment value: {item}"
                )
            if item not in normalized:
                normalized.append(item)
        return normalized

    def validate(self, attrs):
        attrs = super().validate(attrs)

        if not attrs.get("has_external_attendees"):
            attrs["external_attendee_notes"] = ""

        instance = MeetingBooking(
            **attrs,
            requester=self.instance.requester if self.instance else self.context["request"].user,
            reference_number=self.instance.reference_number if self.instance else "",
            status=self.instance.status if self.instance else MeetingBooking.Status.PENDING,
        )
        if self.instance:
            instance.pk = self.instance.pk
        instance.clean()
        return attrs


class MeetingBookingRejectSerializer(serializers.Serializer):
    admin_comment = serializers.CharField(max_length=500, trim_whitespace=True)

    def validate_admin_comment(self, value):
        normalized = value.strip()
        if not normalized:
            raise serializers.ValidationError("Admin comment is required.")
        return normalized
