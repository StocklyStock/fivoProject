from django.urls import path, include
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
    ChangePasswordView,
    GoogleLoginView,
    admin_user_stats,
    notification_list_create,
    public_notifications,
    update_notification,
    delete_notification,
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
    path('change-password/', ChangePasswordView.as_view(), name='change-password'), # 로그인시 비밀번호 변경
    path('google-login/', GoogleLoginView.as_view(), name='google_login'),
    path('users/', user_list, name='user_list'),
    path('users/<int:user_id>/delete/', delete_user, name='delete_user'),
    path('users/<int:user_id>/update/', update_user, name='update_user'),
    path('health/', health_check, name='health_check'),  
    path('admin/stats/', admin_user_stats, name='admin_stats'),  # 어드민 페이지의 통계
    path('admin/notifications/', notification_list_create),  # 어드민 알림 설정
    path('notifications/public/', public_notifications,name='public_notifications'),
    path('admin/notifications/<int:notification_id>/update/', update_notification, name='update_notification'),
    path('admin/notifications/<int:notification_id>/delete/', delete_notification, name='delete_notification'),
    path('api/stocks/', include('userRecommend.urls')),
]
