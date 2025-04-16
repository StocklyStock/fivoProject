from apscheduler.schedulers.background import BackgroundScheduler
from app.services.stock_predict_service import run_daily_prediction

# ✅ APScheduler 인스턴스
scheduler = BackgroundScheduler()

# ✅ 매일 오후 4시에 실행 (cron 기반)
scheduler.add_job(run_daily_prediction, 'cron', hour=16, minute=0)

# ✅ 스케줄러 시작
def start():
    scheduler.start()
    print("✅ 스케줄러 시작됨 (매일 오후 4시에 예측 저장)")
