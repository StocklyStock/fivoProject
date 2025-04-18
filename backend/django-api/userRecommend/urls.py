from django.urls import path
from .views import UserStocksView

urlpatterns = [
    path('user-stocks/', UserStocksView.as_view(), name='user-stocks'),
]
