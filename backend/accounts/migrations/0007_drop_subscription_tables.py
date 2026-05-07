from django.db import migrations


SUBSCRIPTION_TABLES = (
    "subscriptions_subscriptionevent",
    "subscriptions_bkashtransaction",
    "subscriptions_usersubscription",
    "subscriptions_plan",
)


def drop_subscription_tables(apps, schema_editor):
    connection = schema_editor.connection
    quote_name = connection.ops.quote_name
    cascade = "" if connection.vendor == "sqlite" else " CASCADE"

    with connection.cursor() as cursor:
        existing_tables = set(connection.introspection.table_names(cursor))
        for table_name in SUBSCRIPTION_TABLES:
            cursor.execute(f"DROP TABLE IF EXISTS {quote_name(table_name)}{cascade}")
        if {"auth_permission", "django_content_type"}.issubset(existing_tables):
            cursor.execute(
                """
                DELETE FROM auth_permission
                WHERE content_type_id IN (
                    SELECT id FROM django_content_type WHERE app_label = %s
                )
                """,
                ["subscriptions"],
            )
            cursor.execute(
                "DELETE FROM django_content_type WHERE app_label = %s",
                ["subscriptions"],
            )
        cursor.execute(
            "DELETE FROM django_migrations WHERE app = %s", ["subscriptions"]
        )


class Migration(migrations.Migration):
    dependencies = [
        (
            "accounts",
            "0006_rename_accounts_em_user_id_idx_accounts_em_user_id_6989e4_idx_and_more",
        ),
    ]

    operations = [
        migrations.RunPython(drop_subscription_tables, migrations.RunPython.noop),
    ]
