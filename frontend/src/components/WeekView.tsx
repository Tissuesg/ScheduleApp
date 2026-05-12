/**
 * 週間表示コンポーネント
 * 月曜〜日曜の7日分をDayCardで表示
 */
import React from 'react';
import type { ScheduleEvent, ParticipantStatus } from '../types';
import DayCard from './DayCard';

interface WeekViewProps {
  weekDates: Date[];
  events: ScheduleEvent[];
  statuses: ParticipantStatus[];
  onEditEvent: (event: ScheduleEvent) => void;
  onDeleteEvent: (id: number) => void;
  onDeleteStatus: (id: number) => void;
  onAddEvent: (dateStr: string) => void;
}

/** 指定日付のイベントを抽出 */
function getEventsForDate(events: ScheduleEvent[], date: Date): ScheduleEvent[] {
  const dateStr = toDateStr(date);
  return events.filter((ev) => {
    if (!ev.start_datetime) return false;
    const evDate = ev.start_datetime.split('T')[0];
    return evDate === dateStr;
  });
}

/** 指定日付のステータスを抽出 */
function getStatusesForDate(
  statuses: ParticipantStatus[],
  date: Date
): ParticipantStatus[] {
  const dateStr = toDateStr(date);
  return statuses.filter((s) => s.target_date === dateStr);
}

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

const WeekView: React.FC<WeekViewProps> = ({
  weekDates,
  events,
  statuses,
  onEditEvent,
  onDeleteEvent,
  onDeleteStatus,
  onAddEvent,
}) => {
  return (
    <div className="week-container" id="week-container">
      {weekDates.map((date) => (
        <DayCard
          key={toDateStr(date)}
          date={date}
          events={getEventsForDate(events, date)}
          statuses={getStatusesForDate(statuses, date)}
          onEditEvent={onEditEvent}
          onDeleteEvent={onDeleteEvent}
          onDeleteStatus={onDeleteStatus}
          onAddEvent={onAddEvent}
        />
      ))}
    </div>
  );
};

export default WeekView;
