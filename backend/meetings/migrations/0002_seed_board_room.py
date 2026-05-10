from django.db import migrations


def seed_board_room(apps, schema_editor):
    MeetingRoom = apps.get_model("meetings", "MeetingRoom")
    MeetingRoom.objects.update_or_create(
        name="Board Room",
        defaults={
            "capacity": 18,
            "equipment": [
                "projector",
                "whiteboard",
                "video_conferencing",
            ],
            "notes": "Default room for meeting scheduling.",
            "is_active": True,
        },
    )


class Migration(migrations.Migration):
    dependencies = [
        ("meetings", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_board_room, migrations.RunPython.noop),
    ]
