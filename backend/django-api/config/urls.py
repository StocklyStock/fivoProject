from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# ✅ 헬스 체크용 뷰
@api_view(["GET"])
def health_check(request):
    return Response({"status": "ok"})

schema_view = get_schema_view(
   openapi.Info(
      title="Fivo 주식 예측 API",
      default_version='v1',
      description="주식 뉴스 기반 예측 API 문서",
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls', namespace='accounts')),
    path('api/health/', health_check),  # ✅ 헬스 체크 엔드포인트
    path('api/chatbot/',include("chatbot.urls")),
    # path('api/favorites/', include('favorites.urls')),
    path('api/stocks/', include('aiRecommendRandom5.urls')), 
    path('docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]
