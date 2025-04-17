from rest_framework import serializers
from .models import FavoriteStock

class FavoriteStockSerializer(serializers.ModelSerializer):
    class Meta:
        model = FavoriteStock
        fields = ['id', 'stock_code', 'stock_name', 'added_at']
        read_only_fields = ['id', 'added_at']

    def validate(self, data):
        user = self.context['request'].user
        stock_code = data['stock_code']

        # 최대 5개 제한
        if FavoriteStock.objects.filter(user=user).count() >= 5:
            raise serializers.ValidationError("즐겨찾기는 최대 5개까지 등록할 수 있습니다.")

        # 중복 종목 방지
        if FavoriteStock.objects.filter(user=user, stock_code=stock_code).exists():
            raise serializers.ValidationError("이미 즐겨찾기한 종목입니다.")

        return data
