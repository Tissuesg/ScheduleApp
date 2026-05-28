import React, { useState, useEffect } from 'react';
import type { Participant, Department } from '../types';
import * as api from '../api';

interface SettingsModalProps {
  participants: Participant[];
  departments: Department[];
  onClose: () => void;
  onUpdate: () => Promise<void>;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  participants,
  departments,
  onClose,
  onUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<'participants' | 'departments'>('participants');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- 人物の管理用のステート ---
  const [newName, setNewName] = useState('');
  const [newOrder, setNewOrder] = useState<number>(0);
  const [newDept1Id, setNewDept1Id] = useState<number | null>(null);
  const [newDept2Id, setNewDept2Id] = useState<number | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editOrder, setEditOrder] = useState<number>(0);
  const [editDept1Id, setEditDept1Id] = useState<number | null>(null);
  const [editDept2Id, setEditDept2Id] = useState<number | null>(null);

  // --- 所属の管理用のステート ---
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptOrder, setNewDeptOrder] = useState<number>(0);

  const [editingDeptId, setEditingDeptId] = useState<number | null>(null);
  const [editDeptName, setEditDeptName] = useState('');
  const [editDeptOrder, setEditDeptOrder] = useState<number>(0);

  // 初期化時に人物・所属の最大表示順を元に初期の表示順をセット
  useEffect(() => {
    const maxOrder = participants.reduce((max, p) => Math.max(max, p.display_order), 0);
    setNewOrder(maxOrder + 10);
  }, [participants, activeTab]);

  useEffect(() => {
    const maxDeptOrder = departments.reduce((max, d) => Math.max(max, d.display_order), 0);
    setNewDeptOrder(maxDeptOrder + 10);
  }, [departments, activeTab]);

  // --- 人物の操作 ---
  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setLoading(true);
    setError(null);
    try {
      await api.createParticipant({
        name: newName.trim(),
        display_order: newOrder,
        department1_id: newDept1Id,
        department2_id: newDept2Id,
      });
      setNewName('');
      setNewDept1Id(null);
      setNewDept2Id(null);
      await onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : '人物の追加に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const startEditParticipant = (p: Participant) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditOrder(p.display_order);
    setEditDept1Id(p.department1_id ?? null);
    setEditDept2Id(p.department2_id ?? null);
  };

  const cancelEditParticipant = () => {
    setEditingId(null);
    setEditName('');
    setEditOrder(0);
    setEditDept1Id(null);
    setEditDept2Id(null);
  };

  const handleUpdateParticipant = async (id: number) => {
    if (!editName.trim()) return;

    setLoading(true);
    setError(null);
    try {
      await api.updateParticipant(id, {
        name: editName.trim(),
        display_order: editOrder,
        department1_id: editDept1Id,
        department2_id: editDept2Id,
      });
      setEditingId(null);
      await onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : '人物の更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteParticipant = async (id: number, name: string) => {
    if (
      !window.confirm(
        `${name} を削除しますか？\n（この人物に関連する予定が残っている場合はエラーになる可能性があります）`
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.deleteParticipant(id);
      await onUpdate();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : '削除に失敗しました（関連する予定がある可能性があります）'
      );
    } finally {
      setLoading(false);
    }
  };

  // --- 所属の操作 ---
  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;

    setLoading(true);
    setError(null);
    try {
      await api.createDepartment({
        name: newDeptName.trim(),
        display_order: newDeptOrder,
      });
      setNewDeptName('');
      await onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : '所属の追加に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const startEditDepartment = (d: Department) => {
    setEditingDeptId(d.id);
    setEditDeptName(d.name);
    setEditDeptOrder(d.display_order);
  };

  const cancelEditDepartment = () => {
    setEditingDeptId(null);
    setEditDeptName('');
    setEditDeptOrder(0);
  };

  const handleUpdateDepartment = async (id: number) => {
    if (!editDeptName.trim()) return;

    setLoading(true);
    setError(null);
    try {
      await api.updateDepartment(id, {
        name: editDeptName.trim(),
        display_order: editDeptOrder,
      });
      setEditingDeptId(null);
      await onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : '所属の更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDepartment = async (id: number, name: string) => {
    if (
      !window.confirm(
        `${name} を削除しますか？\n（すでに人物にこの所属が紐付いている場合はエラーになります）`
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.deleteDepartment(id);
      await onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : '削除に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content settings-modal-content">
        <h2 className="modal-title">⚙️ 設定</h2>

        {error && <div className="error-banner">⚠ {error}</div>}

        {/* タブナビゲーション */}
        <div className="settings-tabs">
          <button
            className={`tab-btn ${activeTab === 'participants' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('participants');
              setError(null);
            }}
          >
            👥 人物の管理
          </button>
          <button
            className={`tab-btn ${activeTab === 'departments' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('departments');
              setError(null);
            }}
          >
            🏢 所属の管理
          </button>
        </div>

        {/* --- 人物の管理タブ --- */}
        {activeTab === 'participants' && (
          <div className="tab-panel">
            <div className="settings-section">
              <h3>人物一覧</h3>
              <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
                ※表示順の数字が小さいほど上に表示されます。
              </p>
              <ul className="participant-list">
                {participants.map((p) => (
                  <li key={p.id} className="participant-list-item">
                    {editingId === p.id ? (
                      <div className="participant-edit-form-advanced">
                        <div className="form-row">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="名前"
                            className="edit-input-name"
                            required
                          />
                          <div className="order-input-wrapper">
                            <label>表示順:</label>
                            <input
                              type="number"
                              value={editOrder}
                              onChange={(e) => setEditOrder(Number(e.target.value))}
                              placeholder="表示順"
                              className="edit-input-order"
                            />
                          </div>
                        </div>
                        <div className="form-row select-row" style={{ marginTop: '8px' }}>
                          <div className="select-wrapper">
                            <label>所属1:</label>
                            <select
                              value={editDept1Id ?? ''}
                              onChange={(e) =>
                                setEditDept1Id(e.target.value ? Number(e.target.value) : null)
                              }
                              className="edit-select-dept"
                            >
                              <option value="">（なし）</option>
                              {departments.map((d) => (
                                <option key={d.id} value={d.id}>
                                  {d.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="select-wrapper">
                            <label>所属2:</label>
                            <select
                              value={editDept2Id ?? ''}
                              onChange={(e) =>
                                setEditDept2Id(e.target.value ? Number(e.target.value) : null)
                              }
                              className="edit-select-dept"
                            >
                              <option value="">（なし）</option>
                              {departments.map((d) => (
                                <option key={d.id} value={d.id}>
                                  {d.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="edit-actions" style={{ marginTop: '12px' }}>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleUpdateParticipant(p.id)}
                            disabled={loading}
                          >
                            保存
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={cancelEditParticipant}
                            disabled={loading}
                          >
                            キャンセル
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="participant-view">
                        <span className="participant-order">[{p.display_order}]</span>
                        <span className="participant-name">{p.name}</span>
                        <span className="participant-depts-label">
                          {p.department1 && (
                            <span className="dept-badge">{p.department1.name}</span>
                          )}
                          {p.department2 && (
                            <span className="dept-badge">{p.department2.name}</span>
                          )}
                        </span>
                        <div className="participant-actions">
                          <button className="btn-text" onClick={() => startEditParticipant(p)}>
                            編集
                          </button>
                          <button
                            className="btn-text btn-danger"
                            onClick={() => handleDeleteParticipant(p.id, p.name)}
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="settings-section"
              style={{ marginTop: '24px', borderTop: '1px solid #eee', paddingTop: '16px' }}
            >
              <h3>人物の追加</h3>
              <form onSubmit={handleAddParticipant} className="participant-add-form-advanced">
                <div className="form-row">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="新しい人物の名前"
                    disabled={loading}
                    className="add-input"
                    required
                  />
                  <div className="order-input-wrapper">
                    <label>表示順:</label>
                    <input
                      type="number"
                      value={newOrder}
                      onChange={(e) => setNewOrder(Number(e.target.value))}
                      placeholder="表示順"
                      disabled={loading}
                      className="add-input-order"
                    />
                  </div>
                </div>
                <div className="form-row select-row" style={{ marginTop: '12px' }}>
                  <div className="select-wrapper">
                    <label>所属1:</label>
                    <select
                      value={newDept1Id ?? ''}
                      onChange={(e) =>
                        setNewDept1Id(e.target.value ? Number(e.target.value) : null)
                      }
                      disabled={loading}
                      className="add-select-dept"
                    >
                      <option value="">（なし）</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="select-wrapper">
                    <label>所属2:</label>
                    <select
                      value={newDept2Id ?? ''}
                      onChange={(e) =>
                        setNewDept2Id(e.target.value ? Number(e.target.value) : null)
                      }
                      disabled={loading}
                      className="add-select-dept"
                    >
                      <option value="">（なし）</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: '16px' }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || !newName.trim()}
                  >
                    追加
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- 所属の管理タブ --- */}
        {activeTab === 'departments' && (
          <div className="tab-panel">
            <div className="settings-section">
              <h3>所属一覧</h3>
              <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
                ※表示順の数字が小さいほど上に表示されます。
              </p>
              <ul className="participant-list">
                {departments.map((d) => (
                  <li key={d.id} className="participant-list-item">
                    {editingDeptId === d.id ? (
                      <div className="participant-edit-form">
                        <input
                          type="text"
                          value={editDeptName}
                          onChange={(e) => setEditDeptName(e.target.value)}
                          placeholder="所属名"
                          className="edit-input-name"
                          required
                        />
                        <input
                          type="number"
                          value={editDeptOrder}
                          onChange={(e) => setEditDeptOrder(Number(e.target.value))}
                          placeholder="表示順"
                          className="edit-input-order"
                        />
                        <button
                          className="btn btn-primary"
                          onClick={() => handleUpdateDepartment(d.id)}
                          disabled={loading}
                        >
                          保存
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={cancelEditDepartment}
                          disabled={loading}
                        >
                          キャンセル
                        </button>
                      </div>
                    ) : (
                      <div className="participant-view">
                        <span className="participant-order">[{d.display_order}]</span>
                        <span className="participant-name">{d.name}</span>
                        <div className="participant-actions">
                          <button className="btn-text" onClick={() => startEditDepartment(d)}>
                            編集
                          </button>
                          <button
                            className="btn-text btn-danger"
                            onClick={() => handleDeleteDepartment(d.id, d.name)}
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="settings-section"
              style={{ marginTop: '24px', borderTop: '1px solid #eee', paddingTop: '16px' }}
            >
              <h3>所属の追加</h3>
              <form onSubmit={handleAddDepartment} className="participant-add-form-advanced">
                <div className="form-row">
                  <input
                    type="text"
                    value={newDeptName}
                    onChange={(e) => setNewDeptName(e.target.value)}
                    placeholder="新しい所属の名前（例: 企画部）"
                    disabled={loading}
                    className="add-input"
                    required
                  />
                  <div className="order-input-wrapper">
                    <label>表示順:</label>
                    <input
                      type="number"
                      value={newDeptOrder}
                      onChange={(e) => setNewDeptOrder(Number(e.target.value))}
                      placeholder="表示順"
                      disabled={loading}
                      className="add-input-order"
                    />
                  </div>
                </div>
                <div style={{ marginTop: '16px' }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || !newDeptName.trim()}
                  >
                    追加
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="modal-actions" style={{ marginTop: '24px' }}>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
