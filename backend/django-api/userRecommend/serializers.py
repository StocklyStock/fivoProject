from rest_framework import serializers
from .models import UserPredictedStock  # ← 모델 경로가 다를 수 있으니 정확한 경로 확인!


class UserPredictSerializer(serializers.ModelSerializer):

    class Meta:
        model = UserPredictedStock
        fields = "__all__"  # 혹은 필요한 필드만 지정해도 OK
