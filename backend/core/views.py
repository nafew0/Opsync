from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet

from .models import AuditLog, Department, Notification
from .permissions import IsAmDm, IsSystemAdmin
from .serializers import (
    AuditLogSerializer,
    DepartmentSerializer,
    DepartmentWriteSerializer,
    NotificationSerializer,
)


class DepartmentViewSet(ModelViewSet):
    queryset = Department.objects.all()

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [IsAuthenticated()]
        return [IsSystemAdmin()]

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return DepartmentWriteSerializer
        return DepartmentSerializer

    def get_queryset(self):
        qs = Department.objects.all()
        if self.action == "list":
            active_only = self.request.query_params.get("active")
            if active_only is None or active_only.lower() in ("1", "true", "yes"):
                qs = qs.filter(is_active=True)
        return qs

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_active = False
        instance.save(update_fields=["is_active"])
        return Response(status=status.HTTP_204_NO_CONTENT)


class NotificationViewSet(ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

    @action(detail=False, methods=["get"], url_path="unread-count")
    def unread_count(self, request):
        count = Notification.objects.filter(recipient=request.user, is_read=False).count()
        return Response({"count": count})

    @action(detail=True, methods=["post"], url_path="read")
    def mark_read(self, request, pk=None):
        notif = self.get_object()
        notif.is_read = True
        notif.save(update_fields=["is_read"])
        return Response({"status": "read"})

    @action(detail=False, methods=["post"], url_path="read-all")
    def mark_all_read(self, request):
        Notification.objects.filter(recipient=request.user, is_read=False).update(
            is_read=True
        )
        return Response({"status": "all read"})


class AuditLogViewSet(ReadOnlyModelViewSet):
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        return [IsAmDm() if not self.request.user.is_superuser else IsAuthenticated()]

    def get_queryset(self):
        qs = AuditLog.objects.select_related("user").all()
        module = self.request.query_params.get("module")
        ref = self.request.query_params.get("reference_number")
        date_from = self.request.query_params.get("date_from")
        date_to = self.request.query_params.get("date_to")
        if module:
            qs = qs.filter(module=module)
        if ref:
            qs = qs.filter(reference_number__icontains=ref)
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)
        return qs
