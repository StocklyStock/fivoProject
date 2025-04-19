from django.db import models
from accounts.models import CustomUser


class UserPredictedStock(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    stock_code = models.CharField(max_length=20)
    company_name = models.CharField(max_length=100)
    predicted_label = models.IntegerField()
    positive_news = models.JSONField()
    risk_score = models.JSONField()
    final_score = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "user_predict"  # ✅ 실제 DB 테이블명 지정
        managed = False

    def __str__(self):
        return f"{self.user.email} - {self.company_name}"
