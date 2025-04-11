from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from datetime import timedelta
import logging

from .models import CustomUser
from .serializers import UserSerializer, UserListSerializer
from .utils import send_verification_code_email

logger = logging.getLogger(__name__)

# ✔️ 시스템 헬스체크 (Docker / Nginx 확인용)
@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({"status": "ok"}, status=status.HTTP_200_OK)

# ✔️ 현재 로그인된 유저 정보 반환
class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

# ✔️ 회원가입
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = serializer.save(is_verified=False)
                send_verification_code_email(user)
                return Response(
                    {"message": "회원가입이 완료되었습니다. 이메일 인증을 완료해주세요."},
                    status=status.HTTP_201_CREATED
                )
            except Exception as e:
                logger.error(f"Register Error: {str(e)}")
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ✔️ 이메일 인증
class VerifyCodeView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({"error": "존재하지 않는 이메일입니다."}, status=status.HTTP_400_BAD_REQUEST)

        if user.is_verified:
            return Response({"message": "이미 인증된 사용자입니다."}, status=status.HTTP_200_OK)

        if not user.email_verification_code or not user.code_created_at:
            return Response({"error": "인증 코드가 발급되지 않았습니다."}, status=status.HTTP_400_BAD_REQUEST)

        if timezone.now() - user.code_created_at > timedelta(minutes=3):
            return Response({"error": "⏰ 인증 시간이 만료되었습니다. 다시 시도해주세요."}, status=status.HTTP_400_BAD_REQUEST)

        if user.email_verification_code != code:
            return Response({"error": "❌ 인증번호가 일치하지 않습니다."}, status=status.HTTP_400_BAD_REQUEST)

        user.is_verified = True
        user.email_verification_code = None
        user.code_created_at = None
        user.save()

        return Response({"message": "✅ 이메일 인증이 완료되었습니다."}, status=status.HTTP_200_OK)

# ✔️ 로그인
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({"error": "존재하지 않는 이메일입니다."}, status=status.HTTP_400_BAD_REQUEST)

        if not user.check_password(password):
            return Response({"error": "비밀번호가 틀렸습니다."}, status=status.HTTP_400_BAD_REQUEST)

        if not user.is_verified:
            return Response({"error": "이메일 인증이 완료되지 않았습니다."}, status=status.HTTP_400_BAD_REQUEST)

        refresh = RefreshToken.for_user(user)
        return Response({
            "message": "로그인 성공",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "email": user.email,
                "nickname": user.nickname,
                "role": "admin" if user.is_staff else "user"
            }
        }, status=status.HTTP_200_OK)

# ✔️ 관리자 전용 - 유저 목록 조회
@api_view(['GET'])
@permission_classes([IsAdminUser])
def user_list(request):
    users = CustomUser.objects.all()
    serializer = UserListSerializer(users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

# ✔️ 관리자 전용 - 유저 삭제
@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_user(request, user_id):
    try:
        user = CustomUser.objects.get(id=user_id)
        user.delete()
        return Response({"message": "유저 삭제 완료!"}, status=status.HTTP_204_NO_CONTENT)
    except CustomUser.DoesNotExist:
        return Response({"error": "유저를 찾을 수 없습니다."}, status=status.HTTP_404_NOT_FOUND)

# ✔️ 관리자 전용 - 유저 정보 수정
@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def update_user(request, user_id):
    try:
        user = CustomUser.objects.get(id=user_id)
    except CustomUser.DoesNotExist:
        return Response({"error": "유저를 찾을 수 없습니다."}, status=status.HTTP_404_NOT_FOUND)

    serializer = UserSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
