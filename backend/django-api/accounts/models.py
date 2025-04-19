# 📄 backend/accounts/models.py

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("이메일은 필수 항목입니다.")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('superuser는 is_staff=True여야 합니다.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('superuser는 is_superuser=True여야 합니다.')

        return self.create_user(email, password, **extra_fields)

def default_owned_stocks():
    return ['삼성전자']

class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    nickname = models.CharField(max_length=30)
    phone = models.CharField(max_length=20,null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    email_verification_code = models.CharField(max_length=6, blank=True, null=True)
    code_created_at = models.DateTimeField(null=True, blank=True)

    # 관리자 권한 관련
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    # ✅ 가입일 필드 추가 (핵심!)
    date_joined = models.DateTimeField(auto_now_add=True)
    
    owned_stocks = models.JSONField(default=default_owned_stocks, blank=True)  # ['005930', '000660'] 같은 구조
    trading_frequency = models.PositiveIntegerField(default=28)  # 0~10 정도의 빈도 기준 (ex. 일주일에 몇 번)
    investment_period_months = models.PositiveIntegerField(default=30)  # 투자기간 (ex. 24개월)
    investment_style = models.CharField(default="안정형")
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nickname', 'phone']

    objects = CustomUserManager()

    def __str__(self):
        return self.email
    
class Notification(models.Model):
    TYPE_CHOICES = (
        ('notice', '공지'),
        ('event', '이벤트'),
    )

    title = models.CharField(max_length=100)
    message = models.TextField()
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.get_type_display()}] {self.title}"