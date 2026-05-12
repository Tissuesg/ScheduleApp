# 幹部スケジュール管理システム

社内LAN向け幹部週間予定表Webアプリケーション

## プロジェクト構成

```
ScheduleApp/
├── docker-compose.yml          # Docker Compose（本番用）
├── backend/                    # FastAPI バックエンド
│   ├── main.py                 # APIメインアプリ
│   ├── models.py               # DBモデル
│   ├── database.py             # DB接続設定
│   ├── seed.py                 # 初期データ投入
│   ├── requirements.txt        # Python依存パッケージ
│   └── Dockerfile
├── frontend/                   # React フロントエンド
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── Dockerfile
│   └── src/
│       ├── main.tsx
│       ├── App.tsx             # メインコンポーネント
│       ├── App.css             # スタイル（印刷CSS含む）
│       ├── api.ts              # API呼び出し
│       ├── types.ts            # 型定義
│       └── components/
│           ├── Toolbar.tsx     # ツールバー
│           ├── WeekView.tsx    # 週間表示
│           ├── DayCard.tsx     # 日別カード
│           ├── EventItem.tsx   # イベント表示
│           ├── EventForm.tsx   # イベント登録/編集
│           ├── StatusForm.tsx  # 休暇登録
│           └── StatusBadge.tsx # 休暇バッジ
└── data/                       # SQLiteデータベース（自動生成）
```

---

## ローカル開発での起動方法

### 1. バックエンド起動

```powershell
cd backend

# 依存パッケージインストール（初回のみ）
pip install -r requirements.txt

# 起動
python main.py
```

→ バックエンドが `http://localhost:8000` で起動します。
→ 初回起動時にDBテーブル作成 + 参加者マスタの初期データが自動投入されます。

### 2. フロントエンド起動

```powershell
cd frontend

# 依存パッケージインストール（初回のみ）
npm install

# 起動
npm run dev
```

→ フロントエンドが `http://localhost:3000` で起動します。
→ ブラウザで `http://localhost:3000` を開いてください。

---

## ポート番号の変更（競合時のリカバリ）

### バックエンド（デフォルト: 8000）

**症状**: `Address already in use` エラーが出る場合

**手順1 — 競合ポートの確認**:
```powershell
# 8000番ポートを使っているプロセスを確認
netstat -ano | findstr :8000
```

**手順2 — ポート変更**:

方法A: 起動時に指定
```powershell
uvicorn main:app --host 0.0.0.0 --port 9000
```

方法B: `main.py` の最終行を編集
```python
uvicorn.run("main:app", host="0.0.0.0", port=9000, reload=True)
```

**手順3 — フロントエンド側も合わせて変更**:
`frontend/vite.config.ts` のプロキシ設定を更新:
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:9000',  // ← 新ポート番号
    changeOrigin: true,
  },
},
```

### フロントエンド（デフォルト: 3000）

**手順1 — ポート変更**:

方法A: 起動時に指定
```powershell
npm run dev -- --port 4000
```

方法B: `vite.config.ts` を編集
```typescript
server: {
  port: 4000,  // ← 新ポート番号
  ...
}
```

### Docker Compose 使用時

`docker-compose.yml` の `ports` を変更:
```yaml
services:
  backend:
    ports:
      - "9000:8000"   # ← ホスト側のポートを変更

  frontend:
    ports:
      - "4000:3000"   # ← ホスト側のポートを変更
```

---

## 社内LANで公開する場合

バックエンドの起動時に `--host 0.0.0.0` を指定すると、
同一ネットワーク内の他のPCからもアクセスできます。

```powershell
# バックエンド
uvicorn main:app --host 0.0.0.0 --port 8000

# フロントエンド
npm run dev -- --host 0.0.0.0
```

アクセスURL例: `http://<サーバーのIPアドレス>:3000`

---

## 機能一覧

- ✅ 週間表示（月曜〜日曜）
- ✅ 前週 / 今週 / 次週 ナビゲーション
- ✅ イベント登録・編集・削除
- ✅ 終日イベント / 時間未定 対応
- ✅ 参加者（幹部）複数選択
- ✅ 休暇管理（年休/出張/病休/午前休/午後休）
- ✅ A4縦印刷最適化
- ✅ 編集履歴（作成日時/更新日時/編集者名）
- ✅ Enterキー保存
