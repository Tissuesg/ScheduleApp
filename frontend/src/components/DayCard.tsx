/**
 * 日別カードコンポーネント
 * 日付ヘッダ + 休暇ステータス + イベント一覧
 */
import React from 'react';
import type { ScheduleEvent, ParticipantStatus } from '../types';
import { DAY_NAMES } from '../types';
import EventItem from './EventItem';
import StatusBadge from './StatusBadge';

interface DayCardProps {
  date: Date;
  events: ScheduleEvent[];
  statuses: ParticipantStatus[];
  onEditEvent: (event: ScheduleEvent) => void;
  onCopyEvent: (event: ScheduleEvent) => void;
  onDeleteEvent: (id: number) => void;
  onDeleteStatus: (id: number) => void;
  onAddEvent: (dateStr: string) => void;
}

function formatDateTitle(d: Date): string {
  const m = d.getMonth() + 1;
  const dd = d.getDate();
  const day = DAY_NAMES[d.getDay()];
  return `${m}月${dd}日（${day}）`;
}

function isToday(d: Date): boolean {
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

function isWeekend(d: Date): boolean {
  return d.getDay() === 0 || d.getDay() === 6;
}

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

const DayCard: React.FC<DayCardProps> = ({
  date,
  events,
  statuses,
  onEditEvent,
  onCopyEvent,
  onDeleteEvent,
  onDeleteStatus,
  onAddEvent,
}) => {
  const today = isToday(date);
  const weekend = isWeekend(date);

  return (
    <div
      className={`day-card ${today ? 'day-card-today' : ''} ${weekend ? 'day-card-weekend' : ''}`}
      id={`day-${toDateStr(date)}`}
    >
      <div className="day-header">
        <div className={`day-title ${date.getDay() === 0 ? 'text-sunday' : ''} ${date.getDay() === 6 ? 'text-saturday' : ''}`}>
          {formatDateTitle(date)}
        </div>
        <button
          className="btn-icon btn-add-event no-print"
          onClick={() => onAddEvent(toDateStr(date))}
          title="この日に予定を追加"
        >
          ＋
        </button>
      </div>

      {/* 休暇ステータス */}
      {statuses.length > 0 && (
        <div className="day-statuses">
          {statuses.map((s) => (
            <StatusBadge
              key={s.id}
              status={s}
              onDelete={onDeleteStatus}
            />
          ))}
        </div>
      )}

      {/* イベント一覧 */}
      {events.length > 0 ? (
        <div className="day-events">
          {events.map((ev) => (
            <EventItem
              key={ev.id}
              event={ev}
              onEdit={onEditEvent}
              onCopy={onCopyEvent}
              onDelete={onDeleteEvent}
            />
          ))}
        </div>
      ) : (
        <div className="day-empty">予定なし</div>
      )}
    </div>
  );
};

export default DayCard;
