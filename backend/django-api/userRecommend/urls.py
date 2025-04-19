from django.urls import path
from .views import user_recommendations

urlpatterns = [
    path("userRecommendations/", user_recommendations, name="user-recommend")
]
