# 経理班スケジュール表（旧：幹部スケジュール管理システム） 仕様書 v2

## 1. システム概要

社内LANで利用するチーム向けスケジュール管理システム。
当初は幹部向けの予定表として設計されたが、経理班でのテスト運用に合わせて機能拡張を行った。

目的：
- スケジュールの一括登録・閲覧・編集・複製
- 週間スケジュールのA4印刷
- チーム内の予定・休暇状況の共有
を簡易かつ高速に行えるようにする。

---

## 2. 技術構成

### フロントエンド
- React
- TypeScript
- Vite

### バックエンド
- FastAPI
- SQLAlchemy

### DB
- SQLite

### 実行環境
- 社内LAN上のWindows共有サーバー (KAIKAKE等)
- バックエンド：Python環境から直接実行 (`uvicorn` 等)
- フロントエンド：Node環境から開発サーバー実行 (`npm run dev`)

---

## 3. 設計思想

「高機能カレンダー」ではなく、**「週間予定表のデジタル化と効率的な印刷」** として設計する。

重要視するもの：
1. 一覧性と印刷品質（A4・1ページに収める）
2. 入力速度（連続入力、複数日の一括登録、コピー登録）
3. カスタマイズ性（ブラウザ上からの登場人物の編集）

Google Calendar風の複雑なUIにはせず、Excelライクなシンプルさを保つ。

---

## 4. 利用者

利用者は社内チーム（経理班など）メンバー。
同時編集人数は最大5〜10人程度を想定。
認証・権限制御は設けていないが、誰が編集したかを文字列で残せるようにしている。

---

## 5. 登場人物（参加者）マスタ

初期は固定マスタだったが、v2より**アプリの「設定画面」から自由にCRUD（作成・更新・削除・並び替え）が可能**になった。

各メンバーは「表示順（display_order）」を持ち、数字が小さい順に画面・印刷時に表示される。

---

## 6. 必要機能

### 6-1. 週間表示
- 1週間単位で表示
- 前週 / 次週 移動
- **特定の日付へのカレンダージャンプ機能**
- 特定人物の予定のみを絞り込み表示
- 印刷ボタン

表示形式：
- 日付ごと縦並び、時間順ソート
- 参加者、場所、備考の表示
- 下部に1秒待機で自動保存される「週間メモ」欄を配置

### 6-2. イベント登録・編集・複製
登録項目：
- 行事名
- 開始日時 / 終了日時
- 場所
- 参加者（複数選択）
- 備考
- 編集者名

仕様：
- 時間未定、終日イベント対応
- Enterキーでの保存対応
- **コピー機能**：既存の予定を複製し、日付や時間を変更して新規登録する機能。

### 6-3. 休暇ステータス管理
休暇種別：
- 年休、出張、病休、午前休、午後休、**早退、その他**

仕様：
- **複数日一括登録**：「開始日」から「終了日」を指定し、期間中に同じステータスを一括登録可能。
- **詳細メモ機能**：「その他」または「病休」を選択した際、自由記述のメモ（例：行き先や期間詳細など）を登録・表示可能。

### 6-4. 印刷
最重要機能。
仕様：
- A4縦固定、CSS print最適化
- 1週間を1ページへ収め、印刷崩れが発生しないよう設計。
- 特定人物を絞り込んだ状態での個人別予定表印刷に対応。

---

## 7. DB設計

### participants
| カラム | 型 | 備考 |
|---|---|---|
| id | INTEGER | PK |
| name | TEXT | メンバー名 |
| display_order | INTEGER | 表示順 |

### events
| カラム | 型 | 備考 |
|---|---|---|
| id | INTEGER | PK |
| title | TEXT | 行事名 |
| start_datetime | DATETIME NULL | |
| end_datetime | DATETIME NULL | |
| all_day | BOOLEAN | |
| location | TEXT | |
| memo | TEXT | |
| created_at | DATETIME | |
| updated_at | DATETIME | |
| updated_by | TEXT | |

### event_participants
| カラム | 型 | 備考 |
|---|---|---|
| id | INTEGER | PK |
| event_id | INTEGER | FK |
| participant_id | INTEGER | FK |

### participant_status
| カラム | 型 | 備考 |
|---|---|---|
| id | INTEGER | PK |
| participant_id | INTEGER | FK |
| target_date | DATE | |
| status | TEXT | 休暇種別 |
| note | TEXT NULL | 病休・その他の詳細メモ |

### week_memos
| カラム | 型 | 備考 |
|---|---|---|
| id | INTEGER | PK |
| week_start_date| DATE | その週の月曜日 |
| content | TEXT | メモ内容 |
| updated_by | TEXT | |

---

## 8. API仕様 (v2追加分含む)

### Events
- `GET /api/events`: 期間指定イベント取得
- `POST /api/events`: イベント登録
- `PUT /api/events/{id}`: イベント更新
- `DELETE /api/events/{id}`: イベント削除

### Participants
- `GET /api/participants`: 参加者マスタ取得
- **`POST /api/participants`**: 新規参加者登録
- **`PUT /api/participants/{id}`**: 参加者情報更新（名前・順序）
- **`DELETE /api/participants/{id}`**: 参加者削除

### Status
- `GET /api/status`: 期間指定ステータス取得
- `POST /api/status`: **複数日一括ステータス登録**（`start_date`, `end_date` を送信して一括Insert）
- `DELETE /api/status/{id}`: ステータス削除

### Week Memos
- `PUT /api/week_memos`: 週間メモのUpsert処理

---

## 9. 今後の展望

- GitHubでのバージョン管理・ブランチ運用（現在 `team-trial-v2` にてテスト中）
- スモールスタート検証後、他部署（本来の幹部用など）への水平展開時のポート分離やDocker運用への切り替え検討
