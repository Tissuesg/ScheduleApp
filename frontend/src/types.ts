/**
 * 型定義
 * 仕様書 §7 DB設計 に対応
 */

/** 参加者（幹部）マスタ */
export interface Participant {
  id: number;
  name: string;
  display_order: number;
}

/** イベント参加者（レスポンス用） */
export interface EventParticipant {
  id: number;
  name: string;
}

/** イベント（予定） */
export interface ScheduleEvent {
  id: number;
  title: string;
  start_datetime: string | null;
  end_datetime: string | null;
  all_day: boolean;
  location: string;
  memo: string;
  created_at: string;
  updated_at: string;
  updated_by: string;
  participants: EventParticipant[];
}

/** イベント登録/更新用 */
export interface EventFormData {
  title: string;
  start_datetime: string;
  end_datetime: string;
  all_day: boolean;
  location: string;
  memo: string;
  participant_ids: number[];
  updated_by: string;
}

/** 休暇ステータス */
export interface ParticipantStatus {
  id: number;
  participant_id: number;
  participant_name: string;
  target_date: string;
  status: string;
}

/** 休暇登録用 */
export interface StatusFormData {
  participant_id: number;
  target_date: string;
  status: string;
}

/** 曜日名 */
export const DAY_NAMES = ['日', '月', '火', '水', '木', '金', '土'];

/** 休暇種別 */
export const STATUS_TYPES = ['年休', '出張', '病休', '午前休', '午後休'];

/** 週間メモ */
export interface WeekMemo {
  id: number | null;
  week_start_date: string;
  content: string;
  updated_at: string;
  updated_by: string;
}

/** 週間メモ更新用 */
export interface WeekMemoUpdate {
  week_start_date: string;
  content: string;
  updated_by: string;
}
