from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import PredictedStock
import random

@api_view(['GET'])
def aiRecommendRandom5(request):
    queryset = list(PredictedStock.objects.filter(predicted_label='3').values('stock_code', 'company_name'))

    if len(queryset) > 5:
        queryset = random.sample(queryset, 5)

    return Response(queryset)