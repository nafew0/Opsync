import threading

from django.conf import settings
from django.core.mail import send_mail


def send_notification(
    recipient,
    title: str,
    message: str,
    module: str,
    reference_number: str = "",
    link: str = "",
) -> None:
    """Create a Notification record and send a non-blocking email."""
    from .models import Notification

    Notification.objects.create(
        recipient=recipient,
        title=title,
        message=message,
        module=module,
        reference_number=reference_number,
        link=link,
    )

    def _send():
        try:
            frontend_url = getattr(settings, "PUBLIC_APP_URL", "").rstrip("/")
            full_link = f"{frontend_url}{link}" if link else frontend_url
            body = f"{message}\n\n{full_link}" if full_link else message
            send_mail(
                subject=f"[BdREN OpsSync] {title}",
                message=body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient.email],
                fail_silently=True,
            )
        except Exception:
            pass

    threading.Thread(target=_send, daemon=True).start()
