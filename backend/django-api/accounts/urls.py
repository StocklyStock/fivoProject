from django.urls import path
from .views import (
    RegisterView,
    VerifyCodeView,
    LoginView,
    CurrentUserView,
    user_list,
    delete_user,
    update_user,
    health_check,
    UpdateUserView,
    DeleteUserView,
    SendPasswordResetCodeView,
    PasswordResetView,
    GoogleLoginView,
)

app_name = 'accounts'

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('verify-code/', VerifyCodeView.as_view(), name='verify_code'),
    path('login/', LoginView.as_view(), name='login'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('me/update/', UpdateUserView.as_view(), name='update_self'), # 회원전용 수정
    path('me/delete/', DeleteUserView.as_view(), name='delete_self'), # 회원전용 삭제
    path('send-reset-code/', SendPasswordResetCodeView.as_view(), name='send_reset_code'), # 비밀번호 재설정 코드 전송용
    path('reset-password/', PasswordResetView.as_view(), name='reset_password'), # 비밀번호 재설정
    path('google-login/', GoogleLoginView.as_view(), name='google_login'),
    path('users/', user_list, name='user_list'),
    path('users/<int:user_id>/delete/', delete_user, name='delete_user'),
    path('users/<int:user_id>/update/', update_user, name='update_user'),
    path('health/', health_check, name='health_check'),  # ✅ 이거 꼭 필요
]
