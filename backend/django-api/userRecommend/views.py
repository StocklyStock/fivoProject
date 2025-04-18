from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from services.stock_code_collector import get_all_user_stock_codes

class UserStocksView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        codes = get_all_user_stock_codes(request.user)
        return Response({"stock_codes": codes})