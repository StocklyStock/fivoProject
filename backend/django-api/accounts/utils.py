# 📄 backend/accounts/utils.py

import random
from django.core.mail import send_mail
from django.utils import timezone
from django.conf import settings

def generate_verification_code():
    return str(random.randint(100000, 999999))  # 6자리 숫자

def send_verification_code_email(user):
    code = generate_verification_code()
    user.email_verification_code = code
    user.code_created_at = timezone.now()
    user.save()

    subject = "FIVO 이메일 인증번호를 입력해주세요"
    message = f"""
안녕하세요 {user.nickname}님 👋

FIVO에 가입해주셔서 감사합니다!
이메일 인증을 완료하려면 아래 인증번호를 입력해주세요:

✅ 인증번호: {code}

감사합니다.
- FIVO 드림 ☺️
    """.strip()

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )