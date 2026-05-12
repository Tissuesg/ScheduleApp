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
  const [targetDate, setTargetDate] = useState(defaultDate || '');
  const [status, setStatus] = useState(STATUS_TYPES[0]);

  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    setTimeout(() => selectRef.current?.focus(), 100);
  }, []);

  const handleSubmit = () => {
    if (!targetDate) {
      alert('日付を選択してください');
      return;
    }
    onSave({
      participant_id: participantId,
      target_date: targetDate,
      status,
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
          <label>日付</label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            id="input-status-date"
          />
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
