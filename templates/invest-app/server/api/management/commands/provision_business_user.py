import warnings
from getpass import GetPassWarning, getpass

from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.management.base import BaseCommand, CommandError
from django.db import IntegrityError, transaction

from api.models import Business


class Command(BaseCommand):
    help = "Создать учётную запись для существующей компании."

    def add_arguments(self, parser):
        parser.add_argument("--business-id", type=int, required=True)
        parser.add_argument("--username", required=True)

    @staticmethod
    def can_create_user(business, username):
        if business.user_id is not None:
            if business.user.username == username:
                return False
            raise CommandError("К компании уже привязана другая учётная запись")
        if User.objects.filter(username=username).exists():
            raise CommandError("Учётная запись с таким логином уже существует")
        return True

    def handle(self, *args, **options):
        username = User.normalize_username(options["username"].strip())
        business_id = options["business_id"]
        business = Business.objects.select_related("user").filter(pk=business_id).first()
        if business is None:
            raise CommandError("Компания не найдена")
        if not self.can_create_user(business, username):
            self.stdout.write(f"{username} — {business.name}")
            return

        user = User(username=username)
        try:
            user.full_clean(exclude=["password"])
        except ValidationError as exc:
            raise CommandError("; ".join(exc.messages)) from exc

        try:
            with warnings.catch_warnings():
                warnings.simplefilter("error", GetPassWarning)
                password = getpass("Пароль: ")
                confirmation = getpass("Повторите пароль: ")
        except GetPassWarning as exc:
            raise CommandError("Невозможно скрыть ввод пароля; нужен терминал") from exc
        if password != confirmation:
            raise CommandError("Пароли не совпадают")
        try:
            validate_password(password, user)
        except ValidationError as exc:
            raise CommandError("; ".join(exc.messages)) from exc
        user.set_password(password)

        try:
            with transaction.atomic():
                business = Business.objects.select_for_update().filter(pk=business_id).first()
                if business is None:
                    raise CommandError("Компания не найдена")
                if self.can_create_user(business, username):
                    user.save(force_insert=True)
                    business.user = user
                    business.save(update_fields=["user"])
        except IntegrityError as exc:
            if User.objects.filter(username=username).exists():
                raise CommandError("Учётная запись с таким логином уже существует") from exc
            raise

        self.stdout.write(f"{username} — {business.name}")
