"""
幹部スケジュール管理システム — FastAPI メインアプリケーション
仕様書 §9 API仕様 に準拠

ポート変更方法:
  uvicorn main:app --host 0.0.0.0 --port <新ポート番号>
  例: uvicorn main:app --host 0.0.0.0 --port 9000
"""
from datetime import datetime, date
from typing import Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import engine, get_db, Base
from models import Participant, Event, EventParticipant, ParticipantStatus, WeekMemo
from seed import seed_participants


# ---------------------------------------------------------------------------
# Pydantic スキーマ
# ---------------------------------------------------------------------------

class ParticipantOut(BaseModel):
    id: int
    name: str
    display_order: int
    model_config = {"from_attributes": True}


class EventCreate(BaseModel):
    title: str
    start_datetime: Optional[str] = None   # ISO形式 or null
    end_datetime: Optional[str] = None
    all_day: bool = False
    location: str = ""
    memo: str = ""
    participant_ids: list[int] = []
    updated_by: str = ""


class EventUpdate(EventCreate):
    pass


class EventParticipantOut(BaseModel):
    id: int
    name: str
    model_config = {"from_attributes": True}


class EventOut(BaseModel):
    id: int
    title: str
    start_datetime: Optional[str] = None
    end_datetime: Optional[str] = None
    all_day: bool
    location: str
    memo: str
    created_at: str
    updated_at: str
    updated_by: str
    participants: list[EventParticipantOut] = []
    model_config = {"from_attributes": True}


class StatusCreate(BaseModel):
    participant_id: int
    target_date: str         # YYYY-MM-DD
    status: str              # 年休, 出張, 病休, 午前休, 午後休


class StatusOut(BaseModel):
    id: int
    participant_id: int
    participant_name: str = ""
    target_date: str
    status: str
    model_config = {"from_attributes": True}


class WeekMemoUpdate(BaseModel):
    week_start_date: str   # YYYY-MM-DD（月曜日）
    content: str = ""
    updated_by: str = ""


class WeekMemoOut(BaseModel):
    id: int
    week_start_date: str
    content: str
    updated_at: str
    updated_by: str
    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# アプリ初期化
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 起動時: テーブル作成 + シードデータ
    Base.metadata.create_all(bind=engine)
    seed_participants()
    yield

app = FastAPI(title="幹部スケジュール管理システム", lifespan=lifespan)

# CORS（社内LAN内のフロントエンドからのアクセスを許可）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# ユーティリティ
# ---------------------------------------------------------------------------

def parse_dt(s: Optional[str]) -> Optional[datetime]:
    """ISO文字列 → datetime。None/空文字なら None を返す"""
    if not s:
        return None
    return datetime.fromisoformat(s)


def fmt_dt(dt: Optional[datetime]) -> Optional[str]:
    """datetime → ISO文字列"""
    if dt is None:
        return None
    return dt.isoformat()


def fmt_date(d: date) -> str:
    return d.isoformat()


def event_to_out(ev: Event) -> EventOut:
    """Event ORM → EventOut レスポンス"""
    return EventOut(
        id=ev.id,
        title=ev.title,
        start_datetime=fmt_dt(ev.start_datetime),
        end_datetime=fmt_dt(ev.end_datetime),
        all_day=ev.all_day,
        location=ev.location or "",
        memo=ev.memo or "",
        created_at=fmt_dt(ev.created_at) or "",
        updated_at=fmt_dt(ev.updated_at) or "",
        updated_by=ev.updated_by or "",
        participants=[
            EventParticipantOut(id=link.participant.id, name=link.participant.name)
            for link in ev.participant_links
        ],
    )


# ---------------------------------------------------------------------------
# API: 参加者マスタ
# ---------------------------------------------------------------------------

@app.get("/api/participants", response_model=list[ParticipantOut])
def get_participants(db: Session = Depends(get_db)):
    return db.query(Participant).order_by(Participant.display_order).all()


# ---------------------------------------------------------------------------
# API: イベント CRUD
# ---------------------------------------------------------------------------

@app.get("/api/events", response_model=list[EventOut])
def get_events(start_date: str, end_date: str, db: Session = Depends(get_db)):
    """
    指定期間のイベントを取得。
    start_date, end_date は YYYY-MM-DD 形式。
    """
    sd = datetime.fromisoformat(start_date + "T00:00:00")
    ed = datetime.fromisoformat(end_date + "T23:59:59")

    events = (
        db.query(Event)
        .filter(
            # 終日イベント or 時間指定イベント
            (
                (Event.all_day == True) &  # noqa: E712
                (Event.start_datetime >= sd) &
                (Event.start_datetime <= ed)
            ) | (
                (Event.all_day == False) &  # noqa: E712
                (Event.start_datetime != None) &  # noqa: E711
                (Event.start_datetime >= sd) &
                (Event.start_datetime <= ed)
            ) | (
                # 時間未定（start_datetime が NULL）のイベントも含める
                (Event.start_datetime == None) &  # noqa: E711
                (Event.created_at >= sd) &
                (Event.created_at <= ed)
            )
        )
        .order_by(Event.all_day.desc(), Event.start_datetime)
        .all()
    )

    return [event_to_out(ev) for ev in events]


@app.post("/api/events", response_model=EventOut)
def create_event(data: EventCreate, db: Session = Depends(get_db)):
    now = datetime.now()
    ev = Event(
        title=data.title,
        start_datetime=parse_dt(data.start_datetime),
        end_datetime=parse_dt(data.end_datetime),
        all_day=data.all_day,
        location=data.location,
        memo=data.memo,
        updated_by=data.updated_by,
        created_at=now,
        updated_at=now,
    )
    db.add(ev)
    db.flush()  # ev.id 取得

    for pid in data.participant_ids:
        db.add(EventParticipant(event_id=ev.id, participant_id=pid))

    db.commit()
    db.refresh(ev)
    return event_to_out(ev)


@app.put("/api/events/{event_id}", response_model=EventOut)
def update_event(event_id: int, data: EventUpdate, db: Session = Depends(get_db)):
    ev = db.query(Event).filter(Event.id == event_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="イベントが見つかりません")

    ev.title = data.title
    ev.start_datetime = parse_dt(data.start_datetime)
    ev.end_datetime = parse_dt(data.end_datetime)
    ev.all_day = data.all_day
    ev.location = data.location
    ev.memo = data.memo
    ev.updated_by = data.updated_by
    ev.updated_at = datetime.now()

    # 参加者を再設定
    db.query(EventParticipant).filter(EventParticipant.event_id == event_id).delete()
    for pid in data.participant_ids:
        db.add(EventParticipant(event_id=event_id, participant_id=pid))

    db.commit()
    db.refresh(ev)
    return event_to_out(ev)


@app.delete("/api/events/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db)):
    ev = db.query(Event).filter(Event.id == event_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="イベントが見つかりません")
    db.delete(ev)
    db.commit()
    return {"detail": "削除しました"}


# ---------------------------------------------------------------------------
# API: 休暇ステータス
# ---------------------------------------------------------------------------

@app.get("/api/status", response_model=list[StatusOut])
def get_status(start_date: str, end_date: str, db: Session = Depends(get_db)):
    sd = date.fromisoformat(start_date)
    ed = date.fromisoformat(end_date)

    statuses = (
        db.query(ParticipantStatus)
        .filter(
            ParticipantStatus.target_date >= sd,
            ParticipantStatus.target_date <= ed,
        )
        .all()
    )

    return [
        StatusOut(
            id=s.id,
            participant_id=s.participant_id,
            participant_name=s.participant.name,
            target_date=fmt_date(s.target_date),
            status=s.status,
        )
        for s in statuses
    ]


@app.post("/api/status", response_model=StatusOut)
def create_status(data: StatusCreate, db: Session = Depends(get_db)):
    s = ParticipantStatus(
        participant_id=data.participant_id,
        target_date=date.fromisoformat(data.target_date),
        status=data.status,
    )
    db.add(s)
    db.commit()
    db.refresh(s)
    return StatusOut(
        id=s.id,
        participant_id=s.participant_id,
        participant_name=s.participant.name,
        target_date=fmt_date(s.target_date),
        status=s.status,
    )


@app.delete("/api/status/{status_id}")
def delete_status(status_id: int, db: Session = Depends(get_db)):
    s = db.query(ParticipantStatus).filter(ParticipantStatus.id == status_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="ステータスが見つかりません")
    db.delete(s)
    db.commit()
    return {"detail": "削除しました"}


# ---------------------------------------------------------------------------
# API: 週間メモ
# ---------------------------------------------------------------------------

@app.get("/api/week-memo")
def get_week_memo(week_start_date: str, db: Session = Depends(get_db)):
    """指定週のメモを取得"""
    wsd = date.fromisoformat(week_start_date)
    memo = db.query(WeekMemo).filter(WeekMemo.week_start_date == wsd).first()
    if not memo:
        return {"id": None, "week_start_date": week_start_date, "content": "", "updated_at": "", "updated_by": ""}
    return WeekMemoOut(
        id=memo.id,
        week_start_date=fmt_date(memo.week_start_date),
        content=memo.content or "",
        updated_at=fmt_dt(memo.updated_at) or "",
        updated_by=memo.updated_by or "",
    )


@app.put("/api/week-memo")
def update_week_memo(data: WeekMemoUpdate, db: Session = Depends(get_db)):
    """週間メモを更新（存在しなければ新規作成）"""
    wsd = date.fromisoformat(data.week_start_date)
    memo = db.query(WeekMemo).filter(WeekMemo.week_start_date == wsd).first()
    if memo:
        memo.content = data.content
        memo.updated_by = data.updated_by
        memo.updated_at = datetime.now()
    else:
        memo = WeekMemo(
            week_start_date=wsd,
            content=data.content,
            updated_by=data.updated_by,
            updated_at=datetime.now(),
        )
        db.add(memo)
    db.commit()
    db.refresh(memo)
    return WeekMemoOut(
        id=memo.id,
        week_start_date=fmt_date(memo.week_start_date),
        content=memo.content or "",
        updated_at=fmt_dt(memo.updated_at) or "",
        updated_by=memo.updated_by or "",
    )


# ---------------------------------------------------------------------------
# 起動
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
