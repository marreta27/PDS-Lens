# PDS Lens

Tableau CloudのPublic Data Sourceを一覧表示するChrome Extension。

PAT (Personal Access Token) 認証を使用してTableau Cloud REST APIに接続し、サイト内のPublic Data Sourceを簡単に閲覧できます。

## 機能

- PAT認証によるTableau Cloudへの安全な接続
- Public Data Sourceの一覧表示
- データソースの詳細情報表示（タイプ、プロジェクト、オーナー、作成日など）
- 認証情報の保存機能
- シンプルで使いやすいUI

## インストール方法

### 1. リポジトリのクローン

```bash
git clone https://github.com/marreta27/PDS-Lens.git
cd PDS-Lens
```

### 2. Chromeにエクステンションをロード

1. Chromeで `chrome://extensions/` を開く
2. 右上の「デベロッパーモード」を有効にする
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. クローンした `PDS-Lens` フォルダを選択

## 使い方

### 1. Tableau CloudでPATを作成

1. Tableau Cloudにサインイン
2. 設定 > マイプロファイル > 個人用アクセストークン
3. 「新しいトークンを作成」をクリック
4. トークン名を入力し、「作成」をクリック
5. **トークン名**と**トークンシークレット**を安全な場所にコピー

### 2. エクステンションの設定

1. Chromeツールバーの PDS Lens アイコンをクリック
2. 以下の情報を入力:
   - **Server URL**: Tableau CloudのURL（例: `https://your-site.online.tableau.com`）
   - **Site Name**: サイト名（URL内の `#/site/your-site-name` の部分）
   - **Token Name**: 作成したPATのトークン名
   - **Token Secret**: 作成したPATのトークンシークレット

3. 「設定を保存」をクリック（オプション: 次回使用のため）
4. 「接続」をクリック

### 3. Data Sourceの閲覧

接続が成功すると、Public Data Sourceの一覧が表示されます。各データソースには以下の情報が表示されます:

- データソース名
- タイプ
- プロジェクト名
- オーナー
- 作成日
- 認証ステータス（Certified表示）

## ファイル構成

```
PDS-Lens/
├── manifest.json          # Chrome Extension設定ファイル
├── popup.html            # ポップアップUI
├── popup.js              # メインロジック
├── styles.css            # スタイルシート
├── icons/                # アイコンファイル
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md            # このファイル
```

## 技術仕様

- **Manifest Version**: 3
- **Tableau REST API Version**: 3.19
- **認証方式**: Personal Access Token (PAT)
- **権限**:
  - `storage`: 設定情報の保存
  - `https://*.online.tableau.com/*`: Tableau Cloud APIへのアクセス

## セキュリティ

- トークンシークレットはChrome Extension のローカルストレージに保存されます
- APIトークンは使用後に適切にクリアされます
- すべての通信はHTTPSで暗号化されます

**重要**: トークンシークレットは安全に管理してください。定期的にトークンをローテーションすることを推奨します。

## トラブルシューティング

### 認証エラー

- Server URLが正しいか確認（末尾のスラッシュは不要）
- Site Nameが正しいか確認
- PATが有効期限内か確認
- PATに適切な権限があるか確認

### データソースが表示されない

- サイトにPublic Data Sourceが存在するか確認
- PATのユーザーにデータソースの閲覧権限があるか確認

### 接続エラー

- インターネット接続を確認
- Tableau Cloudのステータスを確認
- ブラウザのコンソールでエラーログを確認

## 今後の改善予定

- [ ] データソースの検索・フィルタリング機能
- [ ] お気に入り機能
- [ ] エクスポート機能（CSV、JSON）
- [ ] より詳細なデータソース情報の表示
- [ ] ダークモード対応
- [ ] 多言語対応

## ライセンス

MIT License

## 作者

Created with Claude Code

## 参考リンク

- [Tableau REST API Documentation](https://help.tableau.com/current/api/rest_api/en-us/REST/rest_api.htm)
- [Personal Access Tokens](https://help.tableau.com/current/server/en-us/security_personal_access_tokens.htm)
