from django.db import models
from django.db.models import JSONField

class PredictedStock(models.Model):
    stock_code = models.CharField(max_length=20)
    company_name = models.CharField(max_length=100)
    predicted_label = models.CharField(max_length=10)  # ← 정수 아니고 문자니까 CharField로!
    positive_news = JSONField(null=True, blank=True)
    created_at = models.DateTimeField()

    class Meta:
        db_table = 'predicted_stocks'  # ✅ 테이블명 정확히 일치
        managed = False  # ✅ 이미 만들어진 테이블이니까 마이그레이션 안 함

    def __str__(self):
        return f"{self.company_name} ({self.stock_code})"