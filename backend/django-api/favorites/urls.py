from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FavoriteStockViewSet,DeleteFavoriteByCodeView

router = DefaultRouter()
router.register(r'', FavoriteStockViewSet, basename='favorites')  # ✅ 요렇게

urlpatterns = [
    path('code/<str:stock_code>/', DeleteFavoriteByCodeView.as_view()),  # 추가!
]

urlpatterns += router.urls