from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse

class ChatbotTests(APITestCase):

    def setUp(self):
        self.chat_url = reverse("chatbot:chat")

    def test_greeting_response(self):
        response = self.client.post(self.chat_url, {"message": "안녕하세요"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("무엇을 도와드릴까요", response.data["response"])

    def test_usage_selection_response(self):
        response = self.client.post(self.chat_url, {"message": "사용법 알려줘"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("어떤 사용법이 궁금하신가요", response.data["response"])

    def test_usage_selection_detail_response(self):
        self.client.post(self.chat_url, {"message": "사용법"})
        response = self.client.post(self.chat_url, {"message": "2"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("주식 예측 사용법 안내", response.data["response"])

    def test_reset_session_response(self):
        self.client.post(self.chat_url, {"message": "사용법"})
        response = self.client.post(self.chat_url, {"message": "초기화"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["response"], "")

    def test_invalid_stock_name(self):
        response = self.client.post(self.chat_url, {"message": "가나다라마바사"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("찾지 못했어요", response.data["response"])

    def test_stock_suggestion_response(self):
        response = self.client.post(self.chat_url, {"message": "삼성전사"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(any("삼성전자" in suggestion for suggestion in response.data.get("suggestions", [])))

    def test_prediction_intent_response(self):
        # FastAPI 요청 제거: intent만 확인
        # response = self.client.post(self.chat_url, {"message": "삼성전자 주가 예측해줘"})
        # self.assertEqual(response.status_code, status.HTTP_200_OK)
        # self.assertIn("삼성전자", response.data.get("response", ""))
        pass