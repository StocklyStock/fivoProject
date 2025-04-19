from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import UserPredictedStock
from .serializers import UserPredictSerializer
from accounts.models import CustomUser  # user 모델 import
from django.db.models.expressions import RawSQL


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_recommendations(request):
    user = request.user  # 현재 로그인한 사용자

    # 1️⃣ 사용자 투자 성향 가져오기
    investment_style = user.investment_style  # "공격형", "중립형", "안정형"

    # 2️⃣ 투자 성향 → final_score 키 매핑
    style_key_map = {
        "공격형": "aggressive",
        "중립형": "moderate",
        "안정형": "conservative",
    }
    score_key = style_key_map.get(investment_style)

    if not score_key:
        return Response(
            {"detail": "사용자의 투자 성향이 설정되어 있지 않습니다."}, status=400
        )

    # 3️⃣ 해당 성향 점수 기준으로 정렬
    queryset = (
        UserPredictedStock.objects.filter(user=user)
        .annotate(style_score=RawSQL(f"final_score->>%s", (score_key,)))
        .order_by("-style_score")
    )

    # 4️⃣ 직렬화 및 응답
    serializer = UserPredictSerializer(queryset, many=True)
    return Response(serializer.data)
