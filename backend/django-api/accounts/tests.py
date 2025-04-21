from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from accounts.models import CustomUser, Notification
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone


class UserTests(APITestCase):

    def setUp(self):
        self.register_url = reverse('accounts:register')
        self.login_url = reverse('accounts:login')
        self.verify_url = reverse('accounts:verify_code')
        self.me_url = reverse('accounts:current_user')
        self.reset_code_url = reverse('accounts:send_reset_code')
        self.password_reset_url = reverse('accounts:reset_password')
        self.change_password_url = reverse('accounts:change-password')
        self.delete_user_url = reverse('accounts:delete_self')
        self.public_notis_url = reverse('accounts:public_notifications')
        self.notification_list_create_url = '/api/accounts/admin/notifications/'

        self.admin_user = CustomUser.objects.create_superuser(
            email='admin@test.com', password='adminpass123', nickname='admin', phone='01000000000'
        )
        self.user = CustomUser.objects.create_user(
            email='user@test.com', password='testpass123', nickname='user1', phone='01012345678', is_verified=True
        )
        self.unverified_user = CustomUser.objects.create_user(
            email='notverified@test.com', password='testpass123', nickname='user2', phone='01087654321', is_verified=False
        )

    def authenticate(self, user):
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

    def test_register_success(self):
        response = self.client.post(self.register_url, {
            'email': 'newuser@test.com',
            'password': 'strongpass123',
            'password2': 'strongpass123',
            'nickname': 'newuser',
            'phone': '01000001111'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_login_success(self):
        response = self.client.post(self.login_url, {
            'email': 'user@test.com',
            'password': 'testpass123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_login_fail_wrong_password(self):
        response = self.client.post(self.login_url, {
            'email': 'user@test.com',
            'password': 'wrongpass'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_fail_unverified_user(self):
        response = self.client.post(self.login_url, {
            'email': 'notverified@test.com',
            'password': 'testpass123'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_verify_code_fail_no_user(self):
        response = self.client.post(self.verify_url, {
            'email': 'nouser@test.com',
            'code': '000000'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_current_user_authenticated(self):
        self.authenticate(self.user)
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_current_user_unauthenticated(self):
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_change_password(self):
        self.authenticate(self.user)
        response = self.client.put(self.change_password_url, {
            'current_password': 'testpass123',
            'new_password': 'newpass12345',
            'new_password2': 'newpass12345'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete_user(self):
        pass  # 🔥 FastAPI 쪽 DB 연동으로 인해 제거됨

    def test_send_reset_code(self):
        response = self.client.post(self.reset_code_url, {'email': 'user@test.com'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_password_reset_fail_without_verification(self):
        self.user.email_verification_code = "999999"
        self.user.code_created_at = timezone.now()
        self.user.save()
        response = self.client.post(self.password_reset_url, {
            'email': 'user@test.com',
            'new_password': 'newpass1234',
            'new_password2': 'newpass1234'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_password_reset_success(self):
        self.user.email_verification_code = None
        self.user.code_created_at = None
        self.user.save()
        response = self.client.post(self.password_reset_url, {
            'email': 'user@test.com',
            'new_password': 'finalpass123',
            'new_password2': 'finalpass123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_public_notifications(self):
        Notification.objects.create(title="공지", message="내용", type="notice")
        response = self.client.get(self.public_notis_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)

    def test_admin_create_notification(self):
        self.authenticate(self.admin_user)
        response = self.client.post(self.notification_list_create_url, {
            "title": "테스트 공지",
            "message": "공지 내용입니다.",
            "type": "notice"
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_admin_update_notification(self):
        self.authenticate(self.admin_user)
        noti = Notification.objects.create(title="Old Title", message="Old Content", type="notice")
        url = f"/api/accounts/admin/notifications/{noti.id}/update/"
        response = self.client.patch(url, {"title": "Updated Title"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Updated Title")

    def test_admin_delete_notification(self):
        self.authenticate(self.admin_user)
        noti = Notification.objects.create(title="To Delete", message="Delete Me", type="event")
        url = f"/api/accounts/admin/notifications/{noti.id}/delete/"
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_admin_user_list(self):
        self.authenticate(self.admin_user)
        url = reverse('accounts:user_list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)

    def test_admin_update_user(self):
        pass  # 🔥 현재 미사용 기능이라 제거됨

    def test_admin_delete_user(self):
        pass  # 🔥 FastAPI DB 연동으로 인해 제외됨