/**
 * 休暇登録モーダルフォーム
 * 仕様書 §6-3 に準拠
 */
import React, { useState, useRef, useEffect } from 'react';
import type { Participant, StatusFormData } from '../types';
import { STATUS_TYPES } from '../types';

interface StatusFormProps {
  participants: Participant[];
  defaultDate?: string;
  onSave: (data: StatusFormData) => void;
  onClose: () => void;
}

const StatusForm: React.FC<StatusFormProps> = ({
  participants,
  defaultDate,
  onSave,
  onClose,
}) => {
  const [participantId, setParticipantId] = useState<number>(
    participants[0]?.id || 0
  );
  const [startDate, setStartDate] = useState(defaultDate || '');
  const [endDate, setEndDate] = useState(defaultDate || '');
  const [status, setStatus] = useState(STATUS_TYPES[0]);
  const [note, setNote] = useState('');

  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    setTimeout(() => selectRef.current?.focus(), 100);
  }, []);

  const handleSubmit = () => {
    if (!startDate || !endDate) {
      alert('開始日と終了日を選択してください');
      return;
    }
    if (startDate > endDate) {
      alert('開始日は終了日以前である必要があります');
      return;
    }
    onSave({
      participant_id: participantId,
      start_date: startDate,
      end_date: endDate,
      status,
      note: (status === 'その他' || status === '病休') ? note : undefined,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-small"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        id="status-form-modal"
      >
        <h2 className="modal-title">休暇登録</h2>

        <div className="form-group">
          <label>対象者</label>
          <select
            ref={selectRef}
            value={participantId}
            onChange={(e) => setParticipantId(Number(e.target.value))}
            id="select-participant"
          >
            {participants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>期間</label>
          <div className="form-row">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (endDate < e.target.value) setEndDate(e.target.value);
              }}
              id="input-status-start-date"
            />
            <span style={{ alignSelf: 'center' }}>〜</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              id="input-status-end-date"
            />
          </div>
        </div>

        <div className="form-group">
          <label>種別</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            id="select-status-type"
          >
            {STATUS_TYPES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        { (status === 'その他' || status === '病休') && (
          <div className="form-group">
            <label>詳細内容</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="詳細（任意）"
              id="input-status-note"
            />
          </div>
        )}

        <div className="modal-actions">
          <button className="btn btn-primary" onClick={handleSubmit} id="btn-save-status">
            登録
          </button>
          <button className="btn btn-cancel" onClick={onClose} id="btn-cancel-status">
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusForm;
