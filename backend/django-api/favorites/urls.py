from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FavoriteStockViewSet

router = DefaultRouter()
router.register(r'', FavoriteStockViewSet, basename='favorites')

urlpatterns = [
    path('', include(router.urls)),
]