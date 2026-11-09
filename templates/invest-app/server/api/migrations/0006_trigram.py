from django.contrib.postgres.operations import TrigramExtension
from django.db import migrations


class Migration(migrations.Migration):
    # pg_trgm нужен поиску сделок с опечатками (api/search.py)
    dependencies = [("api", "0005_deal_items")]

    operations = [TrigramExtension()]
