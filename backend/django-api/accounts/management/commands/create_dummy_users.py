from django.core.management.base import BaseCommand
from accounts.models import CustomUser

class Command(BaseCommand):
    help = 'Creates dummy user accounts'

    def handle(self, *args, **kwargs):
        dummy_users = [
            {"email": "user1@fivo.co.kr", "nickname": "v꼬마악마v", "password": "roqkf@1004!", "is_staff": False},
            {"email": "user2@fivo.co.kr", "nickname": "아이시떼루요", "password": "roqkf@1004!", "is_staff": False},
            {"email": "admin@fivo.co.kr",  "nickname": "관리자계정", "password": "roqkf@1004!", "is_staff": True},
        ]

        for user in dummy_users:
            if not CustomUser.objects.filter(email=user["email"]).exists():
                CustomUser.objects.create_user(
                    email=user["email"],
                    password=user["password"],
                    nickname=user["nickname"],
                    is_verified=True,
                    is_staff=user["is_staff"]
                )
                self.stdout.write(self.style.SUCCESS(f'✅ Created {user["email"]}'))
            else:
                self.stdout.write(self.style.WARNING(f'⚠️  Already exists: {user["email"]}'))
