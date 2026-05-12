"""
参加者マスタ初期データ投入
仕様書 §5 に準拠
"""
from database import SessionLocal
from models import Participant

# 幹部マスタ（表示順序付き）
INITIAL_PARTICIPANTS = [
    {"name": "専務理事",       "display_order": 1},
    {"name": "事務局長",       "display_order": 2},
    {"name": "センター長",     "display_order": 3},
    {"name": "医監（附属病院長）", "display_order": 4},
    {"name": "保健部長",       "display_order": 5},
    {"name": "環境部長",       "display_order": 6},
    {"name": "総務部次長",     "display_order": 7},
    {"name": "総務課長",       "display_order": 8},
]


def seed_participants():
    """参加者マスタが空の場合のみ初期データを投入"""
    db = SessionLocal()
    try:
        count = db.query(Participant).count()
        if count == 0:
            for p in INITIAL_PARTICIPANTS:
                db.add(Participant(**p))
            db.commit()
            print(f"[seed] {len(INITIAL_PARTICIPANTS)} 件の参加者を登録しました")
        else:
            print(f"[seed] 参加者データは既に {count} 件存在します。スキップ。")
    finally:
        db.close()


if __name__ == "__main__":
    seed_participants()
