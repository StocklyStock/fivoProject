from django.urls import path
from .views import RegisterView, VerifyCodeView, LoginView, CurrentUserView, user_list, delete_user, update_user, health_check

app_name = 'accounts'

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('verify-code/', VerifyCodeView.as_view(), name='verify_code'),
    path('login/', LoginView.as_view(), name='login'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('users/', user_list, name='user_list'),
    path('users/<int:user_id>/delete/', delete_user, name='delete_user'),
    path('users/<int:user_id>/update/', update_user, name='update_user'),
    path('health/', health_check, name='health_check'),  # ✅ 이거 꼭 필요
]
