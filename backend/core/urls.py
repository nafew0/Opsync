from rest_framework.routers import DefaultRouter

from .views import AuditLogViewSet, DepartmentViewSet, NotificationViewSet

router = DefaultRouter()
router.register("departments", DepartmentViewSet, basename="departments")
router.register("notifications", NotificationViewSet, basename="notifications")
router.register("audit-log", AuditLogViewSet, basename="audit-log")

urlpatterns = router.urls
