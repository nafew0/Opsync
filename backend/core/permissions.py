from rest_framework.permissions import BasePermission

ROLE_HIERARCHY = {
    "employee": 0,
    "supervisor": 1,
    "line_manager": 2,
    "admin_officer": 3,
    "am_dm": 4,
    "finance_officer": 3,
    "system_admin": 5,
}


def _has_role(user, *roles):
    return user.is_authenticated and (
        getattr(user, "opsync_role", None) in roles or user.is_superuser
    )


class IsSupervisor(BasePermission):
    def has_permission(self, request, view):
        return _has_role(
            request.user,
            "supervisor",
            "line_manager",
            "admin_officer",
            "am_dm",
            "system_admin",
        )


class IsLineManager(BasePermission):
    def has_permission(self, request, view):
        return _has_role(
            request.user, "line_manager", "admin_officer", "am_dm", "system_admin"
        )


class IsAdminOfficer(BasePermission):
    def has_permission(self, request, view):
        return _has_role(request.user, "admin_officer", "am_dm", "system_admin")


class IsAmDm(BasePermission):
    def has_permission(self, request, view):
        return _has_role(request.user, "am_dm", "system_admin")


class IsFinanceOfficer(BasePermission):
    def has_permission(self, request, view):
        return _has_role(request.user, "finance_officer", "system_admin")


class IsSystemAdmin(BasePermission):
    def has_permission(self, request, view):
        return _has_role(request.user, "system_admin") or getattr(
            request.user, "is_superuser", False
        )
