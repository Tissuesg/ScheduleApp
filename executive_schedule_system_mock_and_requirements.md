# 幹部スケジュール管理システム

## 1. システム概要

社内LANで利用する幹部スケジュール管理システム。

現状Excelで運用している週間予定表をWebアプリ化する。

目的：

- スケジュール登録
- 閲覧
- 編集
- A4印刷
- 社内共有

を簡易かつ高速に行えるようにする。

---

# 2. 技術構成

## フロントエンド

- React
- TypeScript
- Vite

## バックエンド

- FastAPI
- SQLAlchemy

## DB

- SQLite

## 実行環境

- Docker Compose
- 社内LANサーバー

---

# 3. 設計思想

このシステムは「高機能カレンダー」ではなく、

「幹部週間予定表のデジタル化」

として設計する。

重要視するもの：

1. 一覧性
2. 印刷品質
3. 入力速度
4. シンプルさ

Google Calendar風UIにはしない。

---

# 4. 利用者

利用者は社内職員のみ。

同時編集人数は最大5人程度。

認証・権限制御は初期段階では不要。

ただし編集履歴は保持する。

---

# 5. 登場人物マスタ

以下を固定マスタとして登録する。

- 専務理事
- 事務局長
- センター長
- 医監（附属病院長）
- 保健部長
- 環境部長
- 総務部次長
- 総務課長

---

# 6. 必要機能

## 6-1. 週間表示

- 1週間単位で表示
- 前週 / 次週 移動
- 今日週へ戻る
- 印刷ボタン

表示形式：

- 日付ごと縦並び
- 時間順ソート
- 参加者表示
- 場所表示
- 備考表示

---

## 6-2. イベント登録

登録項目：

- 行事名
- 開始日時
- 終了日時
- 場所
- 参加者（複数選択）
- 備考

仕様：

- 時間未定を許可
- 終日イベント対応
- Enterキー保存可能
- 編集・削除可能

---

## 6-3. 休暇管理

休暇はイベントとは別管理。

休暇種別：

- 年休
- 出張
- 病休
- 午前休
- 午後休

週間表示時に人物名付近へ表示する。

---

## 6-4. 印刷

最重要機能。

仕様：

- A4縦固定
- ブラウザ印刷対応
- CSS print最適化
- 余白調整
- 1週間を1ページへ収める

印刷崩れが発生しないよう設計する。

---

## 6-5. 編集履歴

保持内容：

- 作成日時
- 更新日時
- 編集者名（文字列でOK）

---

# 7. DB設計

## participants

| カラム | 型 |
|---|---|
| id | INTEGER |
| name | TEXT |
| display_order | INTEGER |

---

## events

| カラム | 型 |
|---|---|
| id | INTEGER |
| title | TEXT |
| start_datetime | DATETIME NULL |
| end_datetime | DATETIME NULL |
| all_day | BOOLEAN |
| location | TEXT |
| memo | TEXT |
| created_at | DATETIME |
| updated_at | DATETIME |
| updated_by | TEXT |
| external_id | TEXT NULL |
| sync_source | TEXT NULL |

---

## event_participants

| カラム | 型 |
|---|---|
| id | INTEGER |
| event_id | INTEGER |
| participant_id | INTEGER |

---

## participant_status

| カラム | 型 |
|---|---|
| id | INTEGER |
| participant_id | INTEGER |
| target_date | DATE |
| status | TEXT |

---

# 8. UI要件

## デザイン方針

- シンプル
- 白背景ベース
- Excelライク
- 印刷重視
- 情報量優先

---

## 週間表示モック（HTMLイメージ）

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>幹部週間予定表</title>
  <style>
    body {
      font-family: sans-serif;
      margin: 20px;
      background: #f5f5f5;
    }

    .toolbar {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }

    .week-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .day-card {
      background: white;
      border: 1px solid #ccc;
      padding: 16px;
      border-radius: 8px;
    }

    .day-title {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 12px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 6px;
    }

    .event {
      margin-bottom: 12px;
      padding: 10px;
      background: #fafafa;
      border-left: 4px solid #888;
    }

    .time {
      font-weight: bold;
      margin-bottom: 4px;
    }

    .participants {
      margin-top: 6px;
      color: #444;
    }

    .location {
      color: #666;
      font-size: 14px;
    }

    .memo {
      margin-top: 4px;
      font-size: 13px;
      color: #555;
    }

    @media print {
      body {
        background: white;
        margin: 0;
      }

      .toolbar {
        display: none;
      }

      .day-card {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>

<div class="toolbar">
  <button>前週</button>
  <button>今週</button>
  <button>次週</button>
  <button>新規登録</button>
  <button onclick="window.print()">印刷</button>
</div>

<div class="week-container">

  <div class="day-card">
    <div class="day-title">5月11日（月）</div>

    <div class="event">
      <div class="time">09:00〜10:00</div>
      <div>幹部会議</div>
      <div class="location">場所：大会議室</div>
      <div class="participants">参加：専務理事 / 事務局長 / 医監</div>
      <div class="memo">資料持参</div>
    </div>

    <div class="event">
      <div class="time">14:00〜</div>
      <div>来客対応</div>
      <div class="location">場所：応接室</div>
      <div class="participants">参加：専務理事</div>
    </div>
  </div>

  <div class="day-card">
    <div class="day-title">5月12日（火）</div>

    <div class="event">
      <div class="time">終日</div>
      <div>県外出張</div>
      <div class="participants">参加：環境部長</div>
    </div>
  </div>

</div>

</body>
</html>
```

---

# 9. API仕様

## GET /events

週間イベント一覧取得。

---

## POST /events

イベント登録。

---

## PUT /events/{id}

イベント更新。

---

## DELETE /events/{id}

イベント削除。

---

## GET /participants

参加者マスタ取得。

---

## POST /status

休暇状態登録。

---

# 10. 将来拡張

将来的に以下へ対応可能な設計とする。

- Google Calendar連携
- Outlook連携
- スマホUI
- PWA化
- 通知機能
- CSV出力
- PDF出力

ただし初期実装では不要。

---

# 11. 開発方針

- 小さく作る
- まず一覧表示
- 次に登録編集
- 最後に印刷調整

印刷品質を最優先とする。

AI生成コードでも可読性を維持し、以下を守る：

- 過剰抽象化しない
- ファイル分割しすぎない
- コメントを適切に入れる
- CSSを単純に保つ

---

# 12. 最初に実装する優先順位

1. 週間表示
2. イベントCRUD
3. 印刷
4. 休暇表示
5. 編集履歴
6. UI改善
