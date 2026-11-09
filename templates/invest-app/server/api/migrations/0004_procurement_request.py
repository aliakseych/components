import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0003_business_user"),
    ]

    operations = [
        migrations.CreateModel(
            name="ProcurementRequest",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("commodity", models.CharField(max_length=200, verbose_name="товар")),
                ("category", models.CharField(
                    choices=[("fuel", "Топливо"), ("agro", "Агро"), ("food", "Продукты"), ("construction", "Стройка")],
                    max_length=20,
                    verbose_name="категория",
                )),
                ("quantity", models.DecimalField(decimal_places=2, max_digits=10, verbose_name="объём")),
                ("unit", models.CharField(default="т", max_length=10, verbose_name="единица измерения")),
                ("region", models.CharField(max_length=100, verbose_name="регион")),
                ("request_text", models.TextField(verbose_name="описание потребности")),
                ("status", models.CharField(
                    choices=[
                        ("submitted", "Отправлена"),
                        ("reviewing", "На рассмотрении"),
                        ("linked", "Связана со сделкой"),
                        ("rejected", "Отклонена"),
                    ],
                    default="submitted",
                    max_length=20,
                    verbose_name="статус",
                )),
                ("review_note", models.TextField(blank=True, default="", verbose_name="комментарий оператора")),
                ("created_at", models.DateTimeField(default=django.utils.timezone.now, verbose_name="дата подачи")),
                ("updated_at", models.DateTimeField(auto_now=True, verbose_name="дата обновления")),
                ("business", models.ForeignKey(
                    on_delete=django.db.models.deletion.PROTECT,
                    related_name="procurement_requests",
                    to="api.business",
                    verbose_name="компания",
                )),
                ("deal", models.OneToOneField(
                    blank=True,
                    help_text=(
                        "Связывайте заявку с уже подготовленной оператором сделкой. "
                        "Создание заявки само по себе не публикует её инвесторам."
                    ),
                    null=True,
                    on_delete=django.db.models.deletion.PROTECT,
                    related_name="procurement_request",
                    to="api.deal",
                    verbose_name="сделка",
                )),
            ],
            options={
                "verbose_name": "заявка на закупку",
                "verbose_name_plural": "заявки на закупку",
                "ordering": ["-created_at", "-id"],
            },
        ),
    ]
