"""
マスタ初期データ投入
仕様書 §5 に準拠
"""
from database import SessionLocal
from models import Participant, Department

# 所属マスタ（表示順序付き）
INITIAL_DEPARTMENTS = [
    {"name": "幹部",   "display_order": 10},
    {"name": "総務部", "display_order": 20},
    {"name": "経理班", "display_order": 30},
    {"name": "総務班", "display_order": 40},
]

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


def seed_departments():
    """所属マスタが空の場合のみ初期データを投入"""
    db = SessionLocal()
    try:
        count = db.query(Department).count()
        if count == 0:
            for d in INITIAL_DEPARTMENTS:
                db.add(Department(**d))
            db.commit()
            print(f"[seed] {len(INITIAL_DEPARTMENTS)} 件の所属を登録しました")
        else:
            print(f"[seed] 所属データは既に {count} 件存在します。スキップ。")
    finally:
        db.close()


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
    from database import engine, Base
    from sqlalchemy import text
    Base.metadata.create_all(bind=engine)
    
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE participants ADD COLUMN department1_id INTEGER REFERENCES departments(id)"))
            conn.commit()
            print("[migration] Added department1_id column to participants")
        except Exception:
            pass
            
        try:
            conn.execute(text("ALTER TABLE participants ADD COLUMN department2_id INTEGER REFERENCES departments(id)"))
            conn.commit()
            print("[migration] Added department2_id column to participants")
        except Exception:
            pass
            
    seed_departments()
    seed_participants()
