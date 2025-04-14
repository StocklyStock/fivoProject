import psycopg2
import random
import string
from dotenv import load_dotenv  # 추가
from datetime import datetime, timedelta
import os

load_dotenv(dotenv_path=".env.development") 

# ✅ DB 접속 정보
DB_CONFIG = {
    "dbname": os.getenv("POSTGRES_DB"),
    "user": os.getenv("POSTGRES_USER"),
    "password": os.getenv("POSTGRES_PASSWORD"),
    "host": os.getenv("POSTGRES_HOST"),
    "port": os.getenv("POSTGRES_PORT"),
}

# ✅ 한국식 이름 리스트
surnames = ['김', '이', '박', '서', '정', '강', '곽', '고', '구', '권', '나', '남', '문', '민', '배', '백', '성', '손', '송', '신', '심', '안', '양', '엄', '오', '우', '원', '유', '허', '황', '한', '최', '진', '전', '지', '주', '하', '차', '홍', '임', '윤', '여', '제갈', '성', '소', '조', '라', '변', '마', '공', '안', '선우', '석', '현', '도', '천', '은', '연', '장', '염', '노', '방', '채', '함', '표', '남궁', '우', '형']
names = ["정순", "팔광", "지필", "일제", "마권", "풍광", "덕협", "대무", "덕창", "충유", "원창", "석대", "석도", "덕복", "필수", "신평", "억두", "용팔", "만숙", "효정", "혁동", "팔수", "문숙", "근광", "덕팔", "기혁", "설화", "영숙", "정희", "정숙", "현자", "은영", "경욱", "정국", "영일", "정란", "옥희", "효원", "춘원", "유미", "승래", "진철", "현아", "옥순", "영철", "민철", "병복", "순자", "동석", "경건", "으뜸", "민숙", "미숙", "금식", "명화", "상순", "정임", "우웅", "암식", "수일", "승현", "광일", "기용", "재경", "병훈", "이슬", "배균", "복희", "경자", "은숙", "광진", "종천", "종찬", "상미", "다은", "영선", "정인", "정수", "귀철", "연오", "연우", "대영", "정규", "원호", "희재", "의숙", "의석", "규석", "성혁", "성민", "상현", "인숙", "병진", "병수", "서희", "경자", "석경", "진우", "정환", "선일", "만식", "민식", "정향", "정", "태규", "도상", "재현", "나연", "영환", "옥기", "해신", "귀용", "성진", "경식", "경태", "수옥", "주현", "지영", "윤영", "윤주", "효정", "광민", "병기", "병찬", "민찬", "남수", "은정", "이언", "미란", "은비", "지환", "아름", "정수", "지훈", "동현", "현우", "성민", "정훈", "준호", "성호", "욱", "혜란", "선영", "진종", "진현", "지희", "기현", "서인", "병오", "종성", "은빈", "영빈", "준혁", "현준", "태성", "병훈", "재영", "진호", "민우", "우진", "도현", "주원", "예준", "영숙", "명숙", "정민", "상현", "금자", "효진", "호진", "의정", "춘택", "철수", "영희", "현", "태양", "정미", "석문", "대명", "봉덕", "성구", "덕구", "황구", "수진", "승규", "연희", "지원", "유진", "지은", "주형", "진엽", "은미", "성현", "세인", "지혜", "상진", "성학", "순희", "순복", "겸순", "무환", "규홍", "소희", "일호", "하연", "재석", "명수", "준하", "해인", "혜인","해성", "호석", "호두", "사빈", "사랑", "희정", "윤재", "나영", "재학", "수성", "금성", "지구", "화성", "목성", "민석", "천수", "해수", "명왕", "은별", "훈", "중수", "광수", "광범", "동석", "시무", "명록", "정남", "민수", "영식", "문식", "철식", "이식", "정선", "수선", "병선", "효선", "효성", "준성", "정웅", "영웅", "인아", "인제", "인범", "범찬", "찬혁", "혁기", "기찬", "찬미", "미진", "진솔", "솔비", "지현", "지민", "주찬", "중현", "준현", "현정", "정우", "정열", "말자", "광자", "복자", "분자", "은석", "환재", "영순", "민지", "시은", "시연", "시언", "시우", "강우", "지언", "언아", "아영", "수련", "미림", "다혜", "혜지", "지승", "기순", "순기", "순복", "화임", "남이", "복단", "경순", "금지", "금석", "옥자", "성희", "성미", "경희", "입분", "미라", "현복", "이순", "동엽", "보검", "동원", "호근", "계옥", "말숙", "두팔", "영길", "길석", "정호", "동주", "성주", "진주", "주혜", "승민", "민승", "민아", "재호", "상호", "석호", "혜정", "여정", "은성",  "은민", "혜민", "영민", "광재", "승재", "현석", "인석", "현서", "수지", "준식", "진", "도영", "성훈", "문옥", "준기"]

def generate_code(length=6):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

def random_date():
    start = datetime(2023, 1, 1)
    return start + timedelta(days=random.randint(0, (datetime.now() - start).days))

def random_name():
    return random.choice(surnames) + random.choice(names)

# ✅ 더미 유저 생성
def create_dummy_users(n=100):
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()

    for i in range(n):
        nickname = random_name()  # ✅ 함수명 수정됨
        email = f"{nickname.lower()}{i}@fivo.co.kr"
        date_joined = random_date()
        code = generate_code()
        phone = f"010-{random.randint(1000,9999)}-{random.randint(1000,9999)}"

        sql = """
        INSERT INTO accounts_customuser (
            password, last_login, is_superuser, email,
            is_staff, is_active, date_joined,
            nickname, is_verified, email_verification_code,
            phone
        )
        VALUES (
            %s, NULL, FALSE, %s,
            FALSE, TRUE, %s,
            %s, TRUE, %s,
            %s
        )
        ON CONFLICT (email) DO NOTHING
        """

        values = [
            "pbkdf2_sha256$260000$testsalt$testhashedpassword",  # dummy hash
            email,
            date_joined,
            nickname,
            code,
            phone
        ]

        cursor.execute(sql, values)
        print(f"✅ Inserted: {email}")

    conn.commit()
    cursor.close()
    conn.close()

if __name__ == "__main__":
    create_dummy_users(100)
