# WebRTC スクリーン録画デモ

このプロジェクトは WebRTC を使用したブラウザベースのスクリーン録画ツールです。JavaScript と HTML のみで実装されており、スクリーンキャプチャAPI と MediaDevices API を活用しています。

## 機能

プロジェクトには2つのデモが含まれています：

1. **録画（カメラ付き）** - `recording-screen.html`
   - スクリーンを録画し、カメラ映像をピクチャーインピクチャー形式で表示
   - カメラからの音声も録音

2. **録画（カメラなし）** - `recording-screen-no-own-camera.html`
   - スクリーンのみを録画（カメラ映像なし）

両方のデモで以下が可能です：
- 録画の開始/停止
- 録画したビデオの再生
- WebM形式でのビデオ保存

## 使用方法

1. ブラウザでHTMLファイルを開きます
2. 「録画開始」ボタンをクリックします
3. 録画するスクリーン（全画面またはウィンドウ）を選択します
4. 「録画停止」ボタンをクリックして録画を終了します
5. 録画されたビデオが自動的に再生されます
6. 「動画保存」ボタンをクリックしてWebMファイルとして保存します

## 技術情報

- Screen Capture API を使用してスクリーンを録画
- Canvas API を使用して映像を合成
- MediaRecorder API を使用して録画を実行
- ビデオ形式: WebM (VP9, Opus)

## 参考リソース

- [Screen Capture API の使用](https://developer.mozilla.org/ja/docs/Web/API/Screen_Capture_API/Using_Screen_Capture)
- [MediaDevices.getUserMedia()](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [Canvas API](https://developer.mozilla.org/ja/docs/Web/API/Canvas_API)
- [MediaRecorder API](https://developer.mozilla.org/ja/docs/Web/API/MediaRecorder)
