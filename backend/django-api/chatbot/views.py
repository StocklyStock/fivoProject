from django.urls import path
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import serializers
from rest_framework.views import APIView
from drf_yasg.utils import swagger_auto_schema
import json
import os
from chatbot.utils import (
    get_latest_news, get_financial_risks, interpret_score,
    generate_news_summary, extract_stock_name,class_calculator,generate_financial_risk_report
)
from .mymodel.predict_stock_news_class import predict

# ✅ 시리얼라이저
class ChatRequestSerializer(serializers.Serializer):
    message = serializers.CharField(help_text="유저가 입력한 메시지")

class ChatResponseSerializer(serializers.Serializer):
    response = serializers.CharField()
    interpretation = serializers.CharField(required=False)
    summary = serializers.CharField(required=False)
    suggestions = serializers.ListField(
        child=serializers.CharField(), required=False
    )

# ✅ APIView + Swagger Wrapper
class ChatView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        request_body=ChatRequestSerializer,
        responses={200: ChatResponseSerializer},
        operation_summary="Fivo 챗봇 질문",
        operation_description="메시지를 입력하면 종목 관련 예측 결과를 반환합니다."
    )
    def post(self, request):
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        DATA_PATH = os.path.join(BASE_DIR, "mymodel", "data", "stock_list.json")
        DATA_PATH = os.path.abspath(DATA_PATH)

        with open(DATA_PATH, "r", encoding="utf-8") as f:
            stock_data = json.load(f)

        stock_names = [item["회사명"] for item in stock_data]

        try:
            body = request.data
            msg = body.get("message", "")

            session = request.session
            mode = session.get("mode", None)

            if msg in ["초기화", "대화 초기화", "리셋"]:
                session["mode"] = None
                return Response({"response": ""})

            if mode == "usage_selection":
                session["mode"] = None
                if "1" in msg:
                    return Response({"response": (
                        "🤖 안녕하세요! Fivo bot이에요.\n"
                        "최신 뉴스를 분석해서 종목이 오를지, 떨어질지 예측해주는 똑똑한 AI가 있어요!\n"
                        "궁금한 종목 이름을 입력해보세요 😄"
                    )})
                elif "2" in msg:
                    return Response({"response": (
                        "🤖 주식 예측 사용법 안내\n\n"
                        "1. 예측을 원하는 💡주식 종목명💡을 입력하세요. 예: `삼성전자`, `카카오`, `네이버`\n"
                        "2. 입력한 종목과 관련된 💡최신 뉴스 데이터를 기반💡으로 주가 전망을 예측해드려요. 📈\n"
                        "3. 예측 결과는 5단계로 제공됩니다 : \n"
                        "- 📉 매우 하락\n"
                        "- ⬇ 하락\n"
                        "- ➖ 보합\n"
                        "- ⬆ 상승\n"
                        "- 📈 매우 상승\n\n"
                        "📝 예시: '삼성전자'"
                    )})
                elif "3" in msg:
                    return Response({"response": (
                        "🤖 트리맵 보는법 안내\n\n"
                        " - 테마별로 상승/하락 했는지 알 수 있습니다.\n"
                        " - 테마별 뉴스도 볼 수 있으니 참고해주세요! 📝\n"
                    )})
                elif "4" in msg:
                    return Response({"response": (
                        "🤖 캔들 차트 보는 법 안내\n\n"
                        " - 시가, 종가, 고가, 저가를 시각적으로 보여주는 차트입니다.\n"
                        " - 빨간색(양봉): 종가 > 시가 → 상승\n"
                        " - 파란색(음봉): 종가 < 시가 → 하락\n"
                        " - 꼬리는 변동 폭을 보여줍니다.\n"
                        " - 시장 움직임을 파악할 수 있어요."
                    )})
                else:
                    return Response({"response": "번호를 정확히 입력해주세요! (1~4)"})

            if any(kw in msg for kw in ["사용법", "사이트 사용법"]):
                session["mode"] = "usage_selection"
                return Response({"response": (
                    "🤖 어떤 사용법이 궁금하신가요? 아래 중 번호를 입력해 주세요!\n\n"
                    "1. Fivo 소개\n"
                    "2. 주식 종목별 주가 예측 이용법\n"
                    "3. 트리맵 보는 법\n"
                    "4. 캔들 차트 보는 법"
                )})

            if any(kw in msg for kw in ["안녕", "안녕하세요"]):
                return Response({"response": "🤖 안녕하세요! 무엇을 도와드릴까요?"})

            if any(kw in msg for kw in ["오늘의", "기피", "유망"]):
                return Response({"response": "🤖 오늘의 유망&기피 종목 서비스는 아직 준비중입니다."})

            intent_keywords = ["예측", "괜찮아", "유망", "어때", "왜 올라", "왜 떨어져", "전망", "분석"]

            stock_name, suggestions = extract_stock_name(msg)

            if stock_name:
                if not any(kw in msg for kw in intent_keywords):
                    return Response({
                        "response": f"'{stock_name}'에 대해 어떤 정보가 궁금하신가요? 😊\n예: '{stock_name} 주가 예측해줘'"
                    })

                news_articles = get_latest_news(stock_name)
                news_probs_list = []
                pred_classes = []

                for article in news_articles:
                    preds, probs = predict(article)
                    pred_class = preds[0]
                    prob_dist = probs[0][:4]

                    pred_classes.append(pred_class)
                    news_probs_list.append(prob_dist)

                if not news_probs_list:
                    return Response({"response": "🤖 관련 뉴스를 찾지 못했어요 😥"})

                avg_probs = [sum(p[i] for p in news_probs_list) / len(news_probs_list) for i in range(4)]
                predicted_class = avg_probs.index(max(avg_probs))
                class_score = class_calculator(predicted_class)

                risk_data = get_financial_risks(stock_name)
                risk_msg,risk_score = generate_financial_risk_report(stock_name,risk_data)
                score = class_score+risk_score
                interpretation = interpret_score(score)
                summary = generate_news_summary(news_articles, predicted_class,risk_msg)

                return Response({
                    "response": f"🤖 {stock_name} 종목에 대한 분석 결과예요 📈",
                    "interpretation": interpretation,
                    "summary": summary
                })

            elif suggestions:
                return Response({
                    "response": "🤖 입력하신 종목명을 정확히 찾을 수 없어요. 혹시 아래 중 하나인가요?",
                    "suggestions": suggestions
                })

            else:
                return Response({"response": "🤖 관련된 종목명을 찾지 못했어요 😢"})

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": f"서버 오류: {str(e)}"}, status=500)
