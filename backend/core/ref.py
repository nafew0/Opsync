from django.db import transaction
from django.utils import timezone

from .models import ReferenceCounter

MODULE_CODES = {
    "meetings": "MTG",
    "food": "FOD",
    "logistics": "LOG",
    "fleet": "VEH",
    "claims": "CVY",
}


def generate_reference(module: str) -> str:
    """Atomically increment ReferenceCounter and return BDREN-CODE-YEAR-SEQ."""
    code = MODULE_CODES.get(module, module.upper()[:3])
    year = timezone.now().year

    with transaction.atomic():
        counter, _ = ReferenceCounter.objects.select_for_update().get_or_create(
            module=module, year=year, defaults={"last_seq": 0}
        )
        counter.last_seq += 1
        counter.save(update_fields=["last_seq"])
        seq = counter.last_seq

    return f"BDREN-{code}-{year}-{seq:05d}"
