# favorites/views.py

from rest_framework import viewsets, permissions, status, serializers
from rest_framework.response import Response
from .models import FavoriteStock
from .serializers import FavoriteStockSerializer
from rest_framework.views import APIView

class FavoriteStockViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteStockSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return FavoriteStock.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        user = self.request.user
        if FavoriteStock.objects.filter(user=user).count() >= 5:
            raise serializers.ValidationError("즐겨찾기는 최대 5개까지 가능합니다.")
        serializer.save(user=user)
    def destroy(self, request, *args, **kwargs):
        pk = kwargs.get("pk")
        if not pk:
            return Response({"detail": "pk가 필요합니다."}, status=400)

        try:
            favorite = FavoriteStock.objects.get(pk=pk, user=request.user)
        except FavoriteStock.DoesNotExist:
            return Response({"detail": "해당 즐겨찾기를 찾을 수 없습니다."}, status=404)

        favorite.delete()
        return Response({"detail": f"{favorite.stock_code} 즐겨찾기에서 삭제됨 ✅"}, status=204)

class DeleteFavoriteByCodeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, stock_code):
        user = request.user
        try:
            fav = FavoriteStock.objects.get(user=user, stock_code=stock_code)
            fav.delete()
            return Response({"detail": f"{stock_code} 즐겨찾기 삭제됨 ✅"}, status=204)
        except FavoriteStock.DoesNotExist:
            return Response({"error": "해당 즐겨찾기 항목이 없습니다."}, status=404)