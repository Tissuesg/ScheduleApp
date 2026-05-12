/**
 * イベント表示コンポーネント
 * 個別予定の時間・タイトル・場所・参加者・備考を表示
 */
import React from 'react';
import type { ScheduleEvent } from '../types';

interface EventItemProps {
  event: ScheduleEvent;
  onEdit: (event: ScheduleEvent) => void;
  onDelete: (id: number) => void;
}

/** 時間表示のフォーマット */
function formatTime(ev: ScheduleEvent): string {
  if (ev.all_day) return '終日';
  if (!ev.start_datetime) return '時間未定';

  const start = new Date(ev.start_datetime);
  const sh = start.getHours().toString().padStart(2, '0');
  const sm = start.getMinutes().toString().padStart(2, '0');

  if (ev.end_datetime) {
    const end = new Date(ev.end_datetime);
    const eh = end.getHours().toString().padStart(2, '0');
    const em = end.getMinutes().toString().padStart(2, '0');
    return `${sh}:${sm}〜${eh}:${em}`;
  }

  return `${sh}:${sm}〜`;
}

const EventItem: React.FC<EventItemProps> = ({ event, onEdit, onDelete }) => {
  return (
    <div
      className={`event ${event.all_day ? 'event-allday' : ''}`}
      id={`event-${event.id}`}
    >
      <div className="event-header">
        <span className="event-time">{formatTime(event)}</span>
        <span className="event-title">{event.title}</span>
        <div className="event-actions no-print">
          <button
            className="btn-icon"
            onClick={() => onEdit(event)}
            title="編集"
          >
            ✏️
          </button>
          <button
            className="btn-icon"
            onClick={() => {
              if (window.confirm(`「${event.title}」を削除しますか？`)) {
                onDelete(event.id);
              }
            }}
            title="削除"
          >
            🗑
          </button>
        </div>
      </div>

      {event.location && (
        <div className="event-location">📍 {event.location}</div>
      )}

      {event.participants.length > 0 && (
        <div className="event-participants">
          👤 {event.participants.map((p) => p.name).join(' / ')}
        </div>
      )}

      {event.memo && <div className="event-memo">📝 {event.memo}</div>}
    </div>
  );
};

export default EventItem;
