def user_can_manage_rooms(user):
    return bool(
        user
        and user.is_authenticated
        and (
            getattr(user, "is_superuser", False)
            or getattr(user, "opsync_role", "") == "system_admin"
        )
    )


def user_can_review_bookings(user):
    return bool(
        user
        and user.is_authenticated
        and (
            getattr(user, "is_superuser", False)
            or getattr(user, "opsync_role", "")
            in {"admin_officer", "am_dm", "system_admin"}
        )
    )


def user_can_view_booking(user, booking):
    return bool(
        user
        and user.is_authenticated
        and (
            user_can_review_bookings(user)
            or getattr(booking, "requester_id", None) == getattr(user, "id", None)
        )
    )
