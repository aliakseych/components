import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0007_investor_profile"),
    ]

    operations = [
        migrations.AddField(
            model_name="procurementrequest",
            name="delivery_address",
            field=models.CharField(blank=True, default="", max_length=500, verbose_name="адрес доставки"),
        ),
        migrations.AddField(
            model_name="procurementrequest",
            name="desired_delivery_date",
            field=models.DateField(blank=True, null=True, verbose_name="желаемая дата доставки"),
        ),
        migrations.AddField(
            model_name="procurementrequest",
            name="delivery_terms",
            field=models.TextField(blank=True, default="", max_length=1000, verbose_name="условия доставки"),
        ),
        migrations.CreateModel(
            name="Shipment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("quantity", models.DecimalField(decimal_places=2, max_digits=10, verbose_name="количество")),
                ("status", models.CharField(
                    choices=[("planned", "Запланирована"), ("dispatched", "Отправлена"), ("delivered", "Доставлена")],
                    default="planned", max_length=20, verbose_name="статус",
                )),
                ("planned_date", models.DateField(blank=True, null=True, verbose_name="плановая дата")),
                ("dispatched_at", models.DateField(blank=True, null=True, verbose_name="дата отправки")),
                ("delivered_at", models.DateField(blank=True, null=True, verbose_name="дата доставки")),
                ("destination", models.TextField(blank=True, default="", max_length=500, verbose_name="адрес назначения")),
                ("reference", models.CharField(blank=True, default="", max_length=100, verbose_name="номер документа")),
                ("created_at", models.DateTimeField(default=django.utils.timezone.now, verbose_name="дата записи")),
                ("item", models.ForeignKey(
                    on_delete=django.db.models.deletion.PROTECT, related_name="shipments",
                    to="api.dealitem", verbose_name="товар сделки",
                )),
            ],
            options={
                "verbose_name": "отгрузка",
                "verbose_name_plural": "отгрузки",
                "ordering": ["created_at", "id"],
            },
        ),
    ]
