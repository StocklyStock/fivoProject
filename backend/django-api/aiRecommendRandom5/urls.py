from django.urls import path
from .views import aiRecommendRandom5

urlpatterns = [
    path('aiRecommendRandom5/', aiRecommendRandom5),
]