/**
 * ツールバーコンポーネント
 * 前週/今週/次週ナビ + 参加者フィルタ + 新規登録 + 休暇登録 + 印刷ボタン
 */
import React from 'react';
import type { Participant } from '../types';

interface ToolbarProps {
  weekLabel: string;
  participants: Participant[];
  filterParticipantId: number | null;
  onFilterChange: (id: number | null) => void;
  onPrevWeek: () => void;
  onThisWeek: () => void;
  onNextWeek: () => void;
  onDateSelect: (date: string) => void;
  onNewEvent: () => void;
  onNewStatus: () => void;
  onOpenSettings: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  weekLabel,
  participants,
  filterParticipantId,
  onFilterChange,
  onPrevWeek,
  onThisWeek,
  onNextWeek,
  onDateSelect,
  onNewEvent,
  onNewStatus,
  onOpenSettings,
}) => {
  return (
    <div className="toolbar" id="main-toolbar">
      <div className="toolbar-nav">
        <button className="btn btn-nav" onClick={onPrevWeek} id="btn-prev-week">
          ◀ 前週
        </button>
        <button className="btn btn-nav" onClick={onThisWeek} id="btn-this-week">
          今週
        </button>
        <button className="btn btn-nav" onClick={onNextWeek} id="btn-next-week">
          次週 ▶
        </button>
        <input
          type="date"
          className="nav-date-picker"
          onChange={(e) => {
            if (e.target.value) onDateSelect(e.target.value);
          }}
          title="指定日へジャンプ"
        />
      </div>

      <h1 className="toolbar-title" id="week-label">{weekLabel}</h1>

      <div className="toolbar-actions">
        <select
          className="filter-select"
          value={filterParticipantId ?? ''}
          onChange={(e) =>
            onFilterChange(e.target.value ? Number(e.target.value) : null)
          }
          id="filter-participant"
          title="表示する人物を絞り込み"
        >
          <option value="">全員表示</option>
          {participants.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <button className="btn btn-primary" onClick={onNewEvent} id="btn-new-event">
          ＋ 新規登録
        </button>
        <button className="btn btn-secondary" onClick={onNewStatus} id="btn-new-status">
          休暇登録
        </button>
        <button
          className="btn btn-print"
          onClick={() => window.print()}
          id="btn-print"
        >
          🖨 印刷
        </button>
        <button
          className="btn btn-nav"
          onClick={onOpenSettings}
          title="設定（人物編集）"
          style={{ marginLeft: 'auto' }}
        >
          ⚙️ 設定
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
