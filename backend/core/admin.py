from django.contrib import admin

from .models import AuditLog, Department, Notification, ReferenceCounter


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "is_active", "created_at")
    list_filter = ("is_active",)
    search_fields = ("name", "code")


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("reference_number", "action", "module", "user", "created_at")
    list_filter = ("module", "action")
    search_fields = ("reference_number",)
    readonly_fields = [f.name for f in AuditLog._meta.fields]


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("title", "recipient", "module", "is_read", "created_at")
    list_filter = ("module", "is_read")


@admin.register(ReferenceCounter)
class ReferenceCounterAdmin(admin.ModelAdmin):
    list_display = ("module", "year", "last_seq")
