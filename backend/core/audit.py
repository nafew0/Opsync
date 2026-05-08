def log_action(
    user,
    action: str,
    module: str,
    reference_number: str,
    previous_status: str,
    new_status: str,
    comment: str = "",
    request=None,
) -> None:
    """Create an AuditLog record, optionally extracting IP from request."""
    from .models import AuditLog

    ip_address = None
    if request is not None:
        from opsync.client_ip import get_client_ip
        ip_address = get_client_ip(request)

    AuditLog.objects.create(
        user=user,
        action=action,
        module=module,
        reference_number=reference_number,
        previous_status=previous_status or "",
        new_status=new_status,
        comment=comment,
        ip_address=ip_address,
    )
