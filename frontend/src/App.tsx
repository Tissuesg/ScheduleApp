/**
 * メインアプリケーションコンポーネント
 * 週間スケジュール表示のルート
 *
 * 改修:
 *  - 「幹部職員スケジュール表」見出し追加
 *  - 週間メモ欄
 *  - 参加者フィルタ（個人別抽出 + 印刷対応）
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import type {
  Participant, ScheduleEvent, ParticipantStatus,
  EventFormData, StatusFormData, WeekMemo,
} from './types';
import * as api from './api';
import Toolbar from './components/Toolbar';
import WeekView from './components/WeekView';
import EventForm from './components/EventForm';
import StatusForm from './components/StatusForm';

// ---------------------------------------------------------------------------
// 日付ユーティリティ
// ---------------------------------------------------------------------------

/** 指定日を含む週の月曜日を取得 */
function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? 6 : day - 1;
  date.setDate(date.getDate() - diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

/** 月曜から7日分の配列 */
function getWeekDates(monday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

/** YYYY-MM-DD */
function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

/** 週ラベル */
function getWeekLabel(monday: Date): string {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const y = monday.getFullYear();
  const m1 = monday.getMonth() + 1;
  const d1 = monday.getDate();
  const m2 = sunday.getMonth() + 1;
  const d2 = sunday.getDate();
  return `${y}年 ${m1}/${d1}（月）〜 ${m2}/${d2}（日）`;
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

const App: React.FC = () => {
  // 状態
  const [monday, setMonday] = useState<Date>(() => getMonday(new Date()));
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [statuses, setStatuses] = useState<ParticipantStatus[]>([]);
  const [weekMemo, setWeekMemo] = useState<WeekMemo | null>(null);
  const [memoText, setMemoText] = useState('');
  const [memoSaving, setMemoSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 参加者フィルタ
  const [filterParticipantId, setFilterParticipantId] = useState<number | null>(null);

  // モーダル制御
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [defaultDate, setDefaultDate] = useState<string>('');

  // メモ保存タイマー
  const memoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const weekDates = getWeekDates(monday);
  const startDate = toDateStr(weekDates[0]);
  const endDate = toDateStr(weekDates[6]);

  // -----------------------------------------------------------------------
  // データ取得
  // -----------------------------------------------------------------------

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, e, s, wm] = await Promise.all([
        api.fetchParticipants(),
        api.fetchEvents(startDate, endDate),
        api.fetchStatuses(startDate, endDate),
        api.fetchWeekMemo(startDate),
      ]);
      setParticipants(p);
      setEvents(e);
      setStatuses(s);
      setWeekMemo(wm);
      setMemoText(wm.content || '');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'データの取得に失敗しました'
      );
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // -----------------------------------------------------------------------
  // 週ナビゲーション
  // -----------------------------------------------------------------------

  const goToPrevWeek = () => {
    const d = new Date(monday);
    d.setDate(d.getDate() - 7);
    setMonday(d);
  };

  const goToThisWeek = () => {
    setMonday(getMonday(new Date()));
  };

  const goToNextWeek = () => {
    const d = new Date(monday);
    d.setDate(d.getDate() + 7);
    setMonday(d);
  };

  // -----------------------------------------------------------------------
  // イベント操作
  // -----------------------------------------------------------------------

  const handleNewEvent = () => {
    setEditingEvent(null);
    setDefaultDate(toDateStr(new Date()));
    setShowEventForm(true);
  };

  const handleAddEventOnDate = (dateStr: string) => {
    setEditingEvent(null);
    setDefaultDate(dateStr);
    setShowEventForm(true);
  };

  const handleEditEvent = (event: ScheduleEvent) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleSaveEvent = async (data: EventFormData, id?: number) => {
    try {
      if (id) {
        await api.updateEvent(id, data);
      } else {
        await api.createEvent(data);
      }
      setShowEventForm(false);
      setEditingEvent(null);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : '保存に失敗しました');
    }
  };

  const handleDeleteEvent = async (id: number) => {
    try {
      await api.deleteEvent(id);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : '削除に失敗しました');
    }
  };

  // -----------------------------------------------------------------------
  // 休暇ステータス操作
  // -----------------------------------------------------------------------

  const handleNewStatus = () => {
    setDefaultDate(toDateStr(new Date()));
    setShowStatusForm(true);
  };

  const handleSaveStatus = async (data: StatusFormData) => {
    try {
      await api.createStatus(data);
      setShowStatusForm(false);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : '保存に失敗しました');
    }
  };

  const handleDeleteStatus = async (id: number) => {
    if (!window.confirm('この休暇情報を削除しますか？')) return;
    try {
      await api.deleteStatus(id);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : '削除に失敗しました');
    }
  };

  // -----------------------------------------------------------------------
  // 週間メモ操作
  // -----------------------------------------------------------------------

  const handleMemoChange = (value: string) => {
    setMemoText(value);

    // 入力から1秒後に自動保存
    if (memoTimerRef.current) clearTimeout(memoTimerRef.current);
    memoTimerRef.current = setTimeout(() => {
      saveMemo(value);
    }, 1000);
  };

  const saveMemo = async (content: string) => {
    setMemoSaving(true);
    try {
      await api.updateWeekMemo({
        week_start_date: startDate,
        content,
        updated_by: '',
      });
    } catch (err) {
      console.error('メモ保存エラー:', err);
    } finally {
      setMemoSaving(false);
    }
  };

  // -----------------------------------------------------------------------
  // 参加者フィルタ
  // -----------------------------------------------------------------------

  const filteredEvents = filterParticipantId
    ? events.filter((ev) =>
        ev.participants.some((p) => p.id === filterParticipantId)
      )
    : events;

  const filteredStatuses = filterParticipantId
    ? statuses.filter((s) => s.participant_id === filterParticipantId)
    : statuses;

  const filterName = filterParticipantId
    ? participants.find((p) => p.id === filterParticipantId)?.name || ''
    : '';

  // -----------------------------------------------------------------------
  // レンダリング
  // -----------------------------------------------------------------------

  return (
    <div className="app" id="schedule-app">
      {/* ページ見出し */}
      <div className="app-header" id="app-header">
        <h1 className="app-main-title">幹部職員スケジュール表</h1>
        {filterParticipantId && (
          <span className="filter-label">
            【{filterName} のスケジュール】
          </span>
        )}
      </div>

      <Toolbar
        weekLabel={getWeekLabel(monday)}
        participants={participants}
        filterParticipantId={filterParticipantId}
        onFilterChange={setFilterParticipantId}
        onPrevWeek={goToPrevWeek}
        onThisWeek={goToThisWeek}
        onNextWeek={goToNextWeek}
        onNewEvent={handleNewEvent}
        onNewStatus={handleNewStatus}
      />

      {error && (
        <div className="error-banner" id="error-banner">
          ⚠ {error}
          <button className="btn btn-nav" onClick={loadData}>
            再読み込み
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading" id="loading-indicator">読み込み中...</div>
      ) : (
        <>
          <WeekView
            weekDates={weekDates}
            events={filteredEvents}
            statuses={filteredStatuses}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
            onDeleteStatus={handleDeleteStatus}
            onAddEvent={handleAddEventOnDate}
          />

          {/* 週間メモ欄 */}
          <div className="week-memo" id="week-memo" data-memo-content={memoText}>
            <div className="week-memo-header">
              <h2 className="week-memo-title">📋 週間メモ</h2>
              {memoSaving && (
                <span className="memo-saving-indicator">保存中...</span>
              )}
            </div>
            <textarea
              className="week-memo-textarea"
              value={memoText}
              onChange={(e) => handleMemoChange(e.target.value)}
              placeholder="この週に関するメモを自由に記入できます..."
              rows={4}
              id="week-memo-input"
            />
          </div>
        </>
      )}

      {/* イベント登録/編集モーダル */}
      {showEventForm && (
        <EventForm
          participants={participants}
          editingEvent={editingEvent}
          defaultDate={defaultDate}
          onSave={handleSaveEvent}
          onClose={() => {
            setShowEventForm(false);
            setEditingEvent(null);
          }}
        />
      )}

      {/* 休暇登録モーダル */}
      {showStatusForm && (
        <StatusForm
          participants={participants}
          defaultDate={defaultDate}
          onSave={handleSaveStatus}
          onClose={() => setShowStatusForm(false)}
        />
      )}

      {/* 印刷用フッター */}
      <div className="print-footer">
        幹部職員スケジュール表 — {getWeekLabel(monday)}
        {filterParticipantId ? ` — ${filterName}` : ''}
      </div>
    </div>
  );
};

export default App;
