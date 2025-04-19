from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import UserPredictedStock
from .serializers import UserPredictSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_recommendations(request):
    user = request.user
    queryset = UserPredictedStock.objects.filter(user_id=user.id)
    serializer = UserPredictSerializer(queryset, many=True)
    return Response(serializer.data)
