# 📄 backend/accounts/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser

    # 목록 페이지에서 is_verified 표시
    list_display = ('email', 'nickname', 'is_staff', 'is_verified')
    list_filter = ('is_staff', 'is_active', 'is_verified')

    # 사용자 상세페이지에서 is_verified 수정 가능하게
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('개인 정보', {'fields': ('nickname', 'phone')}),
        ('인증 상태', {'fields': ('is_verified',)}),  # ✅ 추가
        ('권한', {'fields': ('is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')}),
    )

    # 사용자 생성 시에도 is_verified 포함
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'nickname', 'phone', 'password1', 'password2', 'is_staff', 'is_active', 'is_verified')}
        ),
    )

    search_fields = ('email', 'nickname')
    ordering = ('email',)