import React, { useState } from 'react';
import type { Participant } from '../types';
import * as api from '../api';

interface SettingsModalProps {
  participants: Participant[];
  onClose: () => void;
  onUpdate: () => Promise<void>;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ participants, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 新規追加用
  const [newName, setNewName] = useState('');

  // 編集用
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editOrder, setEditOrder] = useState<number>(0);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const maxOrder = participants.reduce((max, p) => Math.max(max, p.display_order), 0);
      await api.createParticipant({ name: newName.trim(), display_order: maxOrder + 10 });
      setNewName('');
      await onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : '追加に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (p: Participant) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditOrder(p.display_order);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditOrder(0);
  };

  const handleUpdate = async (id: number) => {
    if (!editName.trim()) return;

    setLoading(true);
    setError(null);
    try {
      await api.updateParticipant(id, { name: editName.trim(), display_order: editOrder });
      setEditingId(null);
      await onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`${name} を削除しますか？\n（この人物に関連する予定が残っている場合はエラーになる可能性があります）`)) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.deleteParticipant(id);
      await onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : '削除に失敗しました（関連データが存在する可能性があります）');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">⚙️ 設定（人物の管理）</h2>

        {error && <div className="error-banner">⚠ {error}</div>}

        <div className="settings-section">
          <h3>人物一覧</h3>
          <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
            ※表示順の数字が小さいほど上に表示されます。
          </p>
          <ul className="participant-list">
            {participants.map((p) => (
              <li key={p.id} className="participant-list-item">
                {editingId === p.id ? (
                  <div className="participant-edit-form">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="名前"
                      className="edit-input-name"
                    />
                    <input
                      type="number"
                      value={editOrder}
                      onChange={(e) => setEditOrder(Number(e.target.value))}
                      placeholder="表示順"
                      className="edit-input-order"
                      title="表示順"
                    />
                    <button className="btn btn-primary" onClick={() => handleUpdate(p.id)} disabled={loading}>保存</button>
                    <button className="btn btn-secondary" onClick={cancelEdit} disabled={loading}>キャンセル</button>
                  </div>
                ) : (
                  <div className="participant-view">
                    <span className="participant-order">[{p.display_order}]</span>
                    <span className="participant-name">{p.name}</span>
                    <div className="participant-actions">
                      <button className="btn-text" onClick={() => startEdit(p)}>編集</button>
                      <button className="btn-text btn-danger" onClick={() => handleDelete(p.id, p.name)}>削除</button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="settings-section" style={{ marginTop: '24px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
          <h3>人物の追加</h3>
          <form onSubmit={handleAdd} className="participant-add-form">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="新しい人物の名前"
              disabled={loading}
              className="add-input"
            />
            <button type="submit" className="btn btn-primary" disabled={loading || !newName.trim()}>
              追加
            </button>
          </form>
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
