# 動画

https://github.com/user-attachments/assets/7c74cee5-845a-450c-b3b4-e4d2b4486ba2

# 環境構築

1. 依存関係のインストール

```sh
npm i -g pnpm # pnpmをグローバルにインストールしていない場合
pnpm i # Windowsの場合はnpx pnpm i
```

`.env`ファイルに作成

```env
NEXTAUTH_SECRET="" #「openssl rand -base64 32」を実行した結果を貼り付ける
NODE_ENV="development"
DATABASE_URL="postgresql://johndoe:postgres@localhost:54320/mydb?schema=public"
NODE_OPTIONS="--max-http-header-size=1280000" # 必要ならもっとサイズを大きくする
AUTH_MICROSOFT_ENTRA_ID_ID=""
AUTH_MICROSOFT_ENTRA_ID_SECRET=""
AUTH_MICROSOFT_ENTRA_ID_ISSUER=""
VAPID_PUBLIC_KEY=""
VAPID_PRIVATE_KEY=""
NEXT_PUBLIC_VAPID_PUBLIC_KEY="" # VAPID_PUBLIC_KEYと同じものを登録する
OPENAI_API_KEY="" # OpenAIのAPIキー
NEXT_PUBLIC_SIGNIN_OAUTH_ONLY="" # true or falseでログイン画面のメアドパスワード入力を有効にするかどうか
```

`AUTH_MICROSOFT_ENTRA_ID_ID`・`AUTH_MICROSOFT_ENTRA_ID_SECRET`・`AUTH_MICROSOFT_ENTRA_ID_ISSUER`は[ここ](https://entra.microsoft.com/)から作成

手順は[ここ](https://authjs.dev/getting-started/providers/microsoft-entra-id)

`VAPID_PUBLIC_KEY`・`VAPID_PRIVATE_KEY`・`NEXT_PUBLIC_VAPID_PUBLIC_KEY`は以下を実行して出力されたものを貼り付ける

```sh
pnpm web-push generate-vapid-keys
```

2. コンテナ（データベース）の起動とマイグレーション

```bash
docker compose up -d
pnpm migrate
pnpm generate
pnpm seed
```

データベースを見る場合は以下を実行

```sh
pnpm studio
```

3. Next.jsの起動

```sh
pnpm dev # https:// で立ち上げる際は「pnpm dev:ssl」
```

4. コンテナ（データベース）の終了

```bash
docker compose down
```

# ローカルでのビルド・デプロイ

`.env`に以下を追加

```sh
NODE_ENV="production"
NEXTAUTH_URL="" # https://localhost:3000以外のIPアドレスやドメインなど
```

`pnpm dev:ssl`を実行し、証明書ファイルを作成しておく

実行できれば`Ctrl + C`で停止

以下を実行するか、`setup.sh`を実行

```sh
docker compose up -d
pnpm migrate
pnpm generate
pnpm seed
pnpm build
pnpm start:custom
```

同じネットワーク内でならIPアドレス指定でログインできる

# コミット規約

プルリクエストを作成する前に、あなたのコミットがこのリポジトリで使用されているコミット規約に準拠しているかどうかを確認してください。

コミットを作成する際は、次のカテゴリのいずれかを使用しながら、コミットメッセージで規約`カテゴリ: あなたのコミットメッセージ`に従うことをお願いします。

- `feat / feature`: 完全に新しいコードや新機能を導入した場合
- `fix`: バグを修正した変更の場合（可能であれば、詳細も記述する）
- `refactor`: `fix`でも`feat / feature`でもない、コード関連の変更をした場合
- `docs`: 既存のドキュメンテーションの変更や新しいドキュメンテーションを作成した場合（例：READMEやJSDocを記述）
- `build`: ビルドに関する変更、依存関係の変更、新しい依存関係の追加をした場合
- `test`: テストに関する変更をした場合（新しいテストの追加や既存のテストの変更）
- `ci`: 継続的インテグレーションの設定に関する変更をした場合（例：github actions、CIシステムなど）
- `chore`: 上記のいずれにも当てはまらないリポジトリへの変更をした場合

> [!TIP]
>
> 詳しい仕様については、[Conventional Commits](https://www.conventionalcommits.org)を確認するか、[Angular Commit Message Guidelines](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#-commit-message-guidelines)を確認してください。
