"""
SQLAlchemy モデル定義
仕様書 §7 DB設計 に準拠
"""
from datetime import datetime, date
from sqlalchemy import (
    Column, Integer, Text, DateTime, Date, Boolean, ForeignKey
)
from sqlalchemy.orm import relationship
from database import Base


class Participant(Base):
    """参加者（幹部）マスタ"""
    __tablename__ = "participants"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(Text, nullable=False)
    display_order = Column(Integer, nullable=False, default=0)

    # リレーション
    event_links = relationship("EventParticipant", back_populates="participant")
    statuses = relationship("ParticipantStatus", back_populates="participant")


class Event(Base):
    """イベント（予定）"""
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(Text, nullable=False)
    start_datetime = Column(DateTime, nullable=True)   # 時間未定の場合 NULL
    end_datetime = Column(DateTime, nullable=True)      # 時間未定の場合 NULL
    all_day = Column(Boolean, default=False)            # 終日イベント
    location = Column(Text, default="")
    memo = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    updated_by = Column(Text, default="")
    # 将来の外部連携用
    external_id = Column(Text, nullable=True)
    sync_source = Column(Text, nullable=True)

    # リレーション
    participant_links = relationship(
        "EventParticipant", back_populates="event", cascade="all, delete-orphan"
    )


class EventParticipant(Base):
    """イベント ↔ 参加者 中間テーブル"""
    __tablename__ = "event_participants"

    id = Column(Integer, primary_key=True, autoincrement=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    participant_id = Column(Integer, ForeignKey("participants.id"), nullable=False)

    event = relationship("Event", back_populates="participant_links")
    participant = relationship("Participant", back_populates="event_links")


class ParticipantStatus(Base):
    """参加者の日別ステータス（休暇管理）"""
    __tablename__ = "participant_status"

    id = Column(Integer, primary_key=True, autoincrement=True)
    participant_id = Column(Integer, ForeignKey("participants.id"), nullable=False)
    target_date = Column(Date, nullable=False)
    status = Column(Text, nullable=False)  # 年休, 出張, 病休, 午前休, 午後休

    participant = relationship("Participant", back_populates="statuses")


class WeekMemo(Base):
    """週間メモ（週ごとの自由記入欄）"""
    __tablename__ = "week_memos"

    id = Column(Integer, primary_key=True, autoincrement=True)
    week_start_date = Column(Date, nullable=False, unique=True)  # その週の月曜日
    content = Column(Text, default="")
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    updated_by = Column(Text, default="")
