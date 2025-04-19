from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from datetime import timedelta
import logging
from django.utils.timezone import now, timedelta
from django.db.models.functions import TruncDate
from django.db.models import Count

from django.utils.crypto import get_random_string
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from .models import CustomUser
from .serializers import (UserSerializer, UserListSerializer,UserUpdateSerializer,
                          PasswordResetCodeRequestSerializer,PasswordResetSerializer,
                          PasswordChangeSerializer,UserProfileSerializer)
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
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

# ✔️ 회원가입
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = serializer.save(is_verified=False)
                send_verification_code_email(user,purpose="register")
                return Response(
                    {"message": "회원가입이 완료되었습니다. 이메일 인증을 완료해주세요."},
                    status=status.HTTP_201_CREATED
                )
            except Exception as e:
                logger.error(f"Register Error: {str(e)}")
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        print("🛑 serializer errors:", serializer.errors)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class VerifyCodeView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')
        purpose = request.data.get('purpose', 'register')  # 기본값 'register'

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({"error": "존재하지 않는 이메일입니다."}, status=status.HTTP_400_BAD_REQUEST)

        if not user.email_verification_code or not user.code_created_at:
            return Response({"error": "인증 코드가 발급되지 않았습니다."}, status=status.HTTP_400_BAD_REQUEST)

        if timezone.now() - user.code_created_at > timedelta(minutes=3):
            return Response({"error": "⏰ 인증 시간이 만료되었습니다. 다시 시도해주세요."}, status=status.HTTP_400_BAD_REQUEST)

        if user.email_verification_code != code:
            return Response({"error": "❌ 인증번호가 일치하지 않습니다."}, status=status.HTTP_400_BAD_REQUEST)

        # ✅ 목적에 따라 인증 처리 분기
        if purpose == 'register':
            if user.is_verified:
                return Response({"message": "이미 인증된 사용자입니다."}, status=status.HTTP_200_OK)
            user.is_verified = True
        elif purpose == 'reset':
            # 비밀번호 재설정에서는 아무 것도 안 바꿔도 됨
            pass
        else:
            return Response({"error": "잘못된 요청입니다. 인증 목적이 지정되지 않았습니다."}, status=status.HTTP_400_BAD_REQUEST)

        # 공통적으로 코드는 무효화
        user.email_verification_code = None
        user.code_created_at = None
        user.save()

        return Response({"message": f"✅ 인증이 완료되었습니다."}, status=status.HTTP_200_OK)

# ✔️ 로그인
from rest_framework_simplejwt.tokens import RefreshToken
import traceback

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

        try:
            refresh = RefreshToken.for_user(user)
        except Exception as e:
            print("🔥 토큰 생성 중 오류:", str(e))
            print(traceback.format_exc())
            return Response({"error": "토큰 생성 실패"}, status=500)

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
        

class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        id_token_from_front = request.data.get("id_token")
        print("📦 받은 id_token:", id_token_from_front)

        if not id_token_from_front:
            return Response({"error": "토큰이 없습니다."}, status=400)

        try:
            idinfo = id_token.verify_oauth2_token(
                id_token_from_front,
                google_requests.Request()
            )

            email = idinfo["email"]
            name = idinfo.get("name", "")

            # ✅ 1. 먼저 탈퇴한 사용자 인지 확인
            existing_user = CustomUser.objects.filter(email=email).first()
            if existing_user:
                if not existing_user.is_active:
                    return Response({"error": "이미 탈퇴한 사용자입니다."}, status=403)
                user = existing_user
                created = False
            else:
                # ✅ 2. 없으면 새로 생성
                user = CustomUser.objects.create(
                    email=email,
                    nickname=name or "GoogleUser",
                    is_verified=True,
                    phone="구글가입자",
                )
                user.set_password(get_random_string(30))
                user.save()
                created = True

            refresh = RefreshToken.for_user(user)

            return Response({
                "message": "구글 로그인 성공",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "email": user.email,
                    "nickname": user.nickname,
                    "role": "admin" if user.is_staff else "user"
                }
            })

        except ValueError:
            return Response({"error": "유효하지 않은 토큰입니다."}, status=400)

class UpdateUserView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        serializer = UserUpdateSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            try:
                serializer.save()
                return Response({"message": "회원 정보가 성공적으로 수정되었습니다."})
            except Exception as e:
                logger.error(f"Update Error: {str(e)}")
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "비밀번호가 변경되었습니다."}, status=200)
        return Response(serializer.errors, status=400)
    
class DeleteUserView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        try:
            user.delete()
            return Response({"message": "회원 탈퇴가 완료되었습니다."}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            logger.error(f"Delete Error: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
class SendPasswordResetCodeView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetCodeRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = CustomUser.objects.get(email=email)
            except CustomUser.DoesNotExist:
                return Response({"error": "존재하지 않는 이메일입니다."}, status=status.HTTP_400_BAD_REQUEST)

            # ✅ 인증 코드 전송 함수 호출
            send_verification_code_email(user, purpose="reset")

            return Response({"message": "비밀번호 재설정용 인증코드가 이메일로 전송되었습니다."}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class PasswordResetView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = CustomUser.objects.get(email=serializer.validated_data['email'])
            except CustomUser.DoesNotExist:
                return Response({"error": "존재하지 않는 이메일입니다."}, status=status.HTTP_400_BAD_REQUEST)

            # ✅ 인증코드 검증이 끝났는지 확인 (code가 None이면 통과했다고 판단)
            if user.email_verification_code is not None:
                return Response({"error": "이메일 인증이 완료되지 않았습니다."}, status=status.HTTP_400_BAD_REQUEST)

            serializer.save()
            return Response({"message": "비밀번호가 성공적으로 재설정되었습니다."}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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

# ✔️ 관리자 전용 - 통계 조회
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_user_stats(request):

    total_users = CustomUser.objects.count()
    verified_users = CustomUser.objects.filter(is_verified=True).count()
    verification_rate = round((verified_users / total_users) * 100, 2) if total_users else 0

    last_7_days = now() - timedelta(days=6)
    daily_counts = (
        CustomUser.objects.filter(date_joined__gte=last_7_days)
        .annotate(day=TruncDate('date_joined'))
        .values('day')
        .annotate(count=Count('id'))
        .order_by('day')
    )

    return Response({
        "total_users": total_users,
        "verified_users": verified_users,
        "verification_rate": verification_rate,
        "daily_signups": daily_counts,
    }, status=status.HTTP_200_OK)