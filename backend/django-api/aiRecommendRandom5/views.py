from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import PredictedStock
import random
from rest_framework.permissions import AllowAny


@api_view(["GET"])
@permission_classes([AllowAny])  # ✅ 비로그인 허용
def aiRecommendRandom5(request):
    queryset = list(
        PredictedStock.objects.filter(predicted_label='3').values(
            'stock_code', 'company_name', 'positive_news'  # ✅ 요거 추가!
        )
    )

    if len(queryset) > 5:
        queryset = random.sample(queryset, 5)

    return Response(queryset)
