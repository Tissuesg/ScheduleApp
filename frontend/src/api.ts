/**
 * API呼び出し関数
 * バックエンドの各エンドポイントに対応
 */
import type {
  Participant,
  ScheduleEvent,
  EventFormData,
  ParticipantStatus,
  StatusFormData,
  WeekMemo,
  WeekMemoUpdate,
} from './types';

const BASE = '/api';

// ---------------------------------------------------------------------------
// 参加者
// ---------------------------------------------------------------------------

export async function fetchParticipants(): Promise<Participant[]> {
  const res = await fetch(`${BASE}/participants`);
  if (!res.ok) throw new Error('参加者の取得に失敗しました');
  return res.json();
}

export async function createParticipant(data: { name: string; display_order: number }): Promise<Participant> {
  const res = await fetch(`${BASE}/participants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('参加者の登録に失敗しました');
  return res.json();
}

export async function updateParticipant(id: number, data: { name: string; display_order: number }): Promise<Participant> {
  const res = await fetch(`${BASE}/participants/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('参加者の更新に失敗しました');
  return res.json();
}

export async function deleteParticipant(id: number): Promise<void> {
  const res = await fetch(`${BASE}/participants/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('参加者の削除に失敗しました');
}

// ---------------------------------------------------------------------------
// イベント
// ---------------------------------------------------------------------------

export async function fetchEvents(
  startDate: string,
  endDate: string
): Promise<ScheduleEvent[]> {
  const res = await fetch(
    `${BASE}/events?start_date=${startDate}&end_date=${endDate}`
  );
  if (!res.ok) throw new Error('イベントの取得に失敗しました');
  return res.json();
}

export async function createEvent(data: EventFormData): Promise<ScheduleEvent> {
  const res = await fetch(`${BASE}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('イベントの登録に失敗しました');
  return res.json();
}

export async function updateEvent(
  id: number,
  data: EventFormData
): Promise<ScheduleEvent> {
  const res = await fetch(`${BASE}/events/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('イベントの更新に失敗しました');
  return res.json();
}

export async function deleteEvent(id: number): Promise<void> {
  const res = await fetch(`${BASE}/events/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('イベントの削除に失敗しました');
}

// ---------------------------------------------------------------------------
// 休暇ステータス
// ---------------------------------------------------------------------------

export async function fetchStatuses(
  startDate: string,
  endDate: string
): Promise<ParticipantStatus[]> {
  const res = await fetch(
    `${BASE}/status?start_date=${startDate}&end_date=${endDate}`
  );
  if (!res.ok) throw new Error('ステータスの取得に失敗しました');
  return res.json();
}

export async function createStatus(
  data: StatusFormData
): Promise<ParticipantStatus> {
  const res = await fetch(`${BASE}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('ステータスの登録に失敗しました');
  return res.json();
}

export async function deleteStatus(id: number): Promise<void> {
  const res = await fetch(`${BASE}/status/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('ステータスの削除に失敗しました');
}

// ---------------------------------------------------------------------------
// 週間メモ
// ---------------------------------------------------------------------------

export async function fetchWeekMemo(weekStartDate: string): Promise<WeekMemo> {
  const res = await fetch(`${BASE}/week-memo?week_start_date=${weekStartDate}`);
  if (!res.ok) throw new Error('週間メモの取得に失敗しました');
  return res.json();
}

export async function updateWeekMemo(data: WeekMemoUpdate): Promise<WeekMemo> {
  const res = await fetch(`${BASE}/week-memo`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('週間メモの保存に失敗しました');
  return res.json();
}
