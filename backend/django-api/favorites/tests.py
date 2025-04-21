from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import FavoriteStock
from django.urls import reverse

User = get_user_model()

class FavoriteStockTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(email="test@example.com", password="testpass123", nickname="테스트유저", phone="01012345678")
        self.client.force_authenticate(user=self.user)
        self.base_url = "/api/favorites/"

    def test_add_favorite(self):
        data = {"stock_code": "005930", "stock_name": "삼성전자"}
        response = self.client.post(self.base_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(FavoriteStock.objects.count(), 1)

    def test_add_duplicate_favorite(self):
        FavoriteStock.objects.create(user=self.user, stock_code="005930", stock_name="삼성전자")
        data = {"stock_code": "005930", "stock_name": "삼성전자"}
        response = self.client.post(self.base_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("이미 즐겨찾기한 종목입니다.", str(response.data))

    def test_add_favorite_limit(self):
        for i in range(5):
            FavoriteStock.objects.create(user=self.user, stock_code=f"0000{i}", stock_name=f"테스트{i}")
        data = {"stock_code": "123456", "stock_name": "초과종목"}
        response = self.client.post(self.base_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("최대 5개까지", str(response.data))

    def test_delete_favorite_by_pk(self):
        fav = FavoriteStock.objects.create(user=self.user, stock_code="005930", stock_name="삼성전자")
        response = self.client.delete(f"{self.base_url}{fav.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(FavoriteStock.objects.count(), 0)

    def test_delete_favorite_by_code(self):
        FavoriteStock.objects.create(user=self.user, stock_code="005930", stock_name="삼성전자")
        response = self.client.delete(f"{self.base_url}code/005930/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(FavoriteStock.objects.count(), 0)

    def test_get_favorite_list(self):
        FavoriteStock.objects.create(user=self.user, stock_code="005930", stock_name="삼성전자")
        FavoriteStock.objects.create(user=self.user, stock_code="000660", stock_name="SK하이닉스")
        response = self.client.get(self.base_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
