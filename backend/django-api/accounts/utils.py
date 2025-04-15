# 📄 backend/accounts/utils.py

from django.core.mail import send_mail
from django.utils import timezone
from django.conf import settings
import secrets

def generate_verification_code():
    return ''.join([str(secrets.randbelow(10)) for _ in range(6)])
    # random.~ 안쓴이유 : torch에서 이미 random.seed 를 쓰고 있기 때문

def send_verification_code_email(user,purpose):
    code = generate_verification_code()
    print(f"🚀 생성된 인증코드: {code}")
    print(f"👤 유저: {user.email}")
    user.email_verification_code = code
    user.code_created_at = timezone.now()
    user.save()

    # 용도별 메일 구성
    if purpose == "register":
        subject = "FIVO 이메일 인증번호를 입력해주세요"
        message = f"""
안녕하세요 {user.nickname}님 👋

FIVO에 가입해주셔서 감사합니다!
이메일 인증을 완료하려면 아래 인증번호를 입력해주세요:

✅ 인증번호: {code}

감사합니다.
- FIVO 드림 ☺️
        """.strip()
    elif purpose == "reset":
        subject = "[FIVO] 비밀번호 재설정 인증코드"
        message = f"""
{user.nickname}님,

비밀번호 재설정을 위한 인증 코드는 다음과 같습니다:

📌 인증번호: {code}

3분 내로 입력해주세요!

감사합니다.
- FIVO 드림
        """.strip()

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )
    
if __name__ == "__main__":
    print(generate_verification_code())