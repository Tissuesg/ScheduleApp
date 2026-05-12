/**
 * イベント登録/編集モーダルフォーム
 * 仕様書 §6-2 に準拠
 * - Enterキー保存対応
 * - 時間未定/終日イベント対応
 * - 参加者複数選択
 */
import React, { useState, useEffect, useRef } from 'react';
import type { Participant, ScheduleEvent, EventFormData } from '../types';

interface EventFormProps {
  participants: Participant[];
  editingEvent: ScheduleEvent | null;  // null = 新規登録
  defaultDate?: string;                // YYYY-MM-DD（新規時のデフォルト日付）
  onSave: (data: EventFormData, id?: number) => void;
  onClose: () => void;
}

/** datetime-local 用フォーマット */
function toLocalInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${dd}T${hh}:${mm}`;
}

const EventForm: React.FC<EventFormProps> = ({
  participants,
  editingEvent,
  defaultDate,
  onSave,
  onClose,
}) => {
  const isEdit = editingEvent !== null;

  const [title, setTitle] = useState('');
  const [startDt, setStartDt] = useState('');
  const [endDt, setEndDt] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [location, setLocation] = useState('');
  const [memo, setMemo] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [updatedBy, setUpdatedBy] = useState('');

  const titleRef = useRef<HTMLInputElement>(null);

  // 編集時は既存データで初期化
  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title);
      setStartDt(toLocalInput(editingEvent.start_datetime));
      setEndDt(toLocalInput(editingEvent.end_datetime));
      setAllDay(editingEvent.all_day);
      setLocation(editingEvent.location);
      setMemo(editingEvent.memo);
      setSelectedIds(editingEvent.participants.map((p) => p.id));
      setUpdatedBy(editingEvent.updated_by);
    } else if (defaultDate) {
      // 新規時はデフォルト日付の 09:00 を設定
      setStartDt(`${defaultDate}T09:00`);
      setEndDt(`${defaultDate}T10:00`);
    }
    // フォーカス
    setTimeout(() => titleRef.current?.focus(), 100);
  }, [editingEvent, defaultDate]);

  const toggleParticipant = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      alert('行事名を入力してください');
      return;
    }

    const data: EventFormData = {
      title: title.trim(),
      start_datetime: allDay
        ? (startDt ? startDt.split('T')[0] + 'T00:00:00' : '')
        : startDt || '',
      end_datetime: allDay ? '' : endDt || '',
      all_day: allDay,
      location,
      memo,
      participant_ids: selectedIds,
      updated_by: updatedBy,
    };

    onSave(data, isEdit ? editingEvent.id : undefined);
  };

  // Enterキー保存（textarea以外）
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.target instanceof HTMLElement) {
      if (e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        handleSubmit();
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        id="event-form-modal"
      >
        <h2 className="modal-title">
          {isEdit ? '予定を編集' : '新規予定登録'}
        </h2>

        <div className="form-group">
          <label>行事名 *</label>
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例：幹部会議"
            id="input-title"
          />
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              id="input-allday"
            />
            終日イベント
          </label>
        </div>

        {!allDay && (
          <div className="form-row">
            <div className="form-group">
              <label>開始日時</label>
              <input
                type="datetime-local"
                value={startDt}
                onChange={(e) => setStartDt(e.target.value)}
                id="input-start"
              />
            </div>
            <div className="form-group">
              <label>終了日時</label>
              <input
                type="datetime-local"
                value={endDt}
                onChange={(e) => setEndDt(e.target.value)}
                id="input-end"
              />
            </div>
          </div>
        )}

        {allDay && (
          <div className="form-group">
            <label>日付</label>
            <input
              type="date"
              value={startDt ? startDt.split('T')[0] : ''}
              onChange={(e) => setStartDt(e.target.value + 'T00:00')}
              id="input-date-allday"
            />
          </div>
        )}

        <div className="form-group">
          <label>場所</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="例：大会議室"
            id="input-location"
          />
        </div>

        <div className="form-group">
          <label>参加者</label>
          <div className="participant-checkboxes" id="participant-checkboxes">
            {participants.map((p) => (
              <label key={p.id} className="checkbox-label participant-checkbox">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(p.id)}
                  onChange={() => toggleParticipant(p.id)}
                />
                {p.name}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>備考</label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="メモ"
            rows={3}
            id="input-memo"
          />
        </div>

        <div className="form-group">
          <label>編集者名</label>
          <input
            type="text"
            value={updatedBy}
            onChange={(e) => setUpdatedBy(e.target.value)}
            placeholder="例：山田"
            id="input-updated-by"
          />
        </div>

        <div className="modal-actions">
          <button className="btn btn-primary" onClick={handleSubmit} id="btn-save-event">
            {isEdit ? '更新' : '登録'}
          </button>
          <button className="btn btn-cancel" onClick={onClose} id="btn-cancel-event">
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventForm;
