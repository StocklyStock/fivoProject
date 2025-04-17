from django.db import models
from django.conf import settings

class FavoriteStock(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    stock_code = models.CharField(max_length=20)  # 예: '005930'
    stock_name = models.CharField(max_length=100)  # 예: '삼성전자'
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'stock_code')  # 유저당 동일 종목 중복 금지

    def __str__(self):
        return f"{self.user.email} - {self.stock_name} ({self.stock_code})"
