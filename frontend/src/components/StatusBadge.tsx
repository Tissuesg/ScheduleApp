/**
 * 休暇ステータスバッジ
 * 種別に応じた色分け表示
 */
import React from 'react';
import type { ParticipantStatus } from '../types';

interface StatusBadgeProps {
  status: ParticipantStatus;
  onDelete?: (id: number) => void;
}

/** 休暇種別ごとの色クラス */
const statusColorClass = (s: string): string => {
  switch (s) {
    case '年休': return 'status-nenkyuu';
    case '出張': return 'status-shutchou';
    case '病休': return 'status-byoukyuu';
    case '午前休': return 'status-amkyuu';
    case '午後休': return 'status-pmkyuu';
    default: return 'status-default';
  }
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, onDelete }) => {
  const displayText = status.status === 'その他' && status.note
    ? `その他（${status.note}）`
    : status.status;

  return (
    <span className={`status-badge ${statusColorClass(status.status)}`}>
      {status.participant_name}：{displayText}
      {onDelete && (
        <button
          className="status-delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(status.id);
          }}
          title="削除"
        >
          ×
        </button>
      )}
    </span>
  );
};

export default StatusBadge;
