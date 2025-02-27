# JS_WebRTC: ブラウザベースのスクリーン録画ツール

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

純粋な JavaScript/HTML/CSS で構築された、シンプルかつパワフルなブラウザベースのスクリーン録画ツールです。WebRTC、MediaDevices および Canvas API を使用して、サーバーサイド処理を必要とせずにブラウザのみで機能します。

![スクリーンショット](https://github.com/user-attachments/assets/d603d78a-9b0b-46bf-9ef3-f5c5c7f80864)

## ✨ 主な機能

- **ノーサーバー**: サーバーサイドの処理や特別なバックエンドが不要
- **プライバシー重視**: すべてのデータはローカルで処理、どこにも送信されません
- **クロスブラウザ対応**: 主要なモダンブラウザで動作（Chrome, Firefox, Edge, Opera）
- **ユーザーフレンドリー**: シンプルで直感的なインターフェース
- **複数の録画モード**: カメラ付き/なしの 2 つのモード

## 🚀 デモ

このリポジトリには 2 つの録画モードがあります：

1. **📹 カメラ付き録画** - `recording-screen.html`

   - スクリーン録画＋カメラ映像を Picture-in-Picture 形式で表示
   - Zoom/Meet のようなレイアウトで録画可能
   - カメラビデオと音声を同時録画

2. **🖥️ カメラなし録画** - `recording-screen-no-own-camera.html`
   - スクリーンのみをクリーンに録画
   - シンプルなスクリーンキャプチャが必要な場合に理想的

**共通機能:**

- リアルタイム録画時間表示
- ワンクリック録画開始・停止
- 録画後の自動プレビュー
- タイムスタンプ付き WebM ファイルとして保存

## 🔧 使い方

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/Yulikepython/JS_WebRTC.git

# プロジェクトフォルダに移動
cd JS_WebRTC

# ローカルサーバーで実行 (オプション)
# Python 3を使用する場合
python -m http.server 8000

# または Node.jsを使用する場合
npx http-server .
```

### 使用方法

1. ブラウザで適切な HTML ファイルを開きます

   - `recording-screen.html` (カメラ付き)
   - `recording-screen-no-own-camera.html` (カメラなし)

2. 「録画開始」ボタンをクリックします

3. 共有するスクリーン（全画面、アプリケーションウィンドウ、ブラウザタブ）を選択

4. カメラ付き版の場合は、カメラとマイクへのアクセスを許可

5. 「録画停止」をクリックして録画を終了

6. 録画されたビデオが自動的に再生されます

7. 「動画保存」ボタンをクリックしてファイルとして保存

## ⚠️ 注意事項と FAQ

### ブラウザサポート

| ブラウザ | 状態 | 最低バージョン     |
| -------- | ---- | ------------------ |
| Chrome   | ✅   | 72+                |
| Firefox  | ✅   | 66+                |
| Edge     | ✅   | 79+ (Chromium)     |
| Opera    | ✅   | 60+                |
| Safari   | ⚠️   | 最新版のみ一部対応 |
| IE       | ❌   | 非対応             |

※ 一部のサポートは理論上のものであり、実際の動作はブラウザのバージョンや設定に依存します。
※ サポート情報は、2025 年 2 月 27 日時点の最新情報です。

### よくある質問

**Q: 長時間の録画は可能ですか？**  
A: 理論的には可能ですが、ブラウザのメモリ制限によって制約される場合があります。高解像度で長時間の録画は、十分な RAM を持つ端末で行うことをお勧めします。

**Q: 録画ファイルのサイズは？**  
A: ファイルサイズは録画内容、解像度、長さによって異なります。WebM 形式で圧縮されますが、長時間の録画では数百 MB になる可能性があります。

**Q: 特定のウィンドウのみを録画できますか？**  
A: はい、録画開始時にブラウザが表示する共有画面選択ダイアログで特定のウィンドウやアプリケーションを選択できます。

**Q: 音声も録音されますか？**  
A: カメラ付き版では、カメラに接続されたマイクからの音声が録音されます。システム音声の録音はブラウザや OS の制限により異なります。

## 🛠️ 技術スタック

- **フロントエンド**: 純粋な HTML, CSS, JavaScript
- **キャプチャ技術**: WebRTC (getUserMedia, getDisplayMedia)
- **ビデオ処理**: Canvas API
- **録画**: MediaRecorder API
- **ファイル操作**: File API, Blob

### 出力仕様

- **コンテナ形式**: WebM
- **ビデオコーデック**: VP9（フォールバック: VP8）
- **オーディオコーデック**: Opus
- **フレームレート**: 30fps

## 👥 プロジェクトへの貢献

あなたの貢献を歓迎します！バグ修正、機能追加、ドキュメント改善など、さまざまな形での参加が可能です。

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチをプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを開く

詳細は[CONTRIBUTING.md](CONTRIBUTING.md)をご覧ください。

## 📋 今後の計画

- [ ] 録画品質設定オプションの追加
- [ ] カメラ位置・サイズのカスタマイズ
- [ ] 一時停止/再開機能
- [ ] システム音声のキャプチャ対応拡充
- [ ] モバイルデバイス対応の改善

## 📜 免責事項

このソフトウェアは「現状のまま」提供されており、明示または黙示を問わず、いかなる種類の保証もありません。作者または著作権所有者は、契約行為、不法行為、またはそれ以外であろうと、ソフトウェアに起因または関連し、またはソフトウェアの使用またはその他の扱いによって生じる一切の請求、損害、その他の責任について責任を負いません。

## 📄 ライセンス

このプロジェクトは[MIT ライセンス](LICENSE)のもとで公開されています。詳細は LICENSE ファイルをご覧ください。

## 🔗 参考リソース

- [MDN: Screen Capture API](https://developer.mozilla.org/ja/docs/Web/API/Screen_Capture_API/Using_Screen_Capture)
- [MDN: MediaDevices.getUserMedia()](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [MDN: Canvas API](https://developer.mozilla.org/ja/docs/Web/API/Canvas_API)
- [MDN: MediaRecorder API](https://developer.mozilla.org/ja/docs/Web/API/MediaRecorder)

---

**作成者・メンテナ**: [Hiroshi Nishito]  
**問い合わせ**: GitHub の Issue を通じてご連絡ください。
