const screenVideo = document.getElementById('screenVideo');
const cameraVideo = document.getElementById('cameraVideo');
const cameraContainer = document.getElementById('cameraContainer');
const replayVideo = document.getElementById('replayVideo');
const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');
const saveButton = document.getElementById('save');
const statusText = document.getElementById('statusText');
const statusBar = document.getElementById('statusBar');

let mediaRecorder;
let recordedBlobs = [];
let animationFrameId = null;
let recordingStartTime = null;
let recordingTimer = null;
let screenStream = null;
let cameraStream = null;

// デバッグ情報を表示しUIも更新するヘルパー関数
function logStatus(message) {
  console.log(`[状態] ${message}`);
  statusText.textContent = message;
}

// リソースの解放処理をまとめた関数
function cleanupResources() {
  // アニメーションフレームをキャンセル
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  
  // タイマーをクリア
  if (recordingTimer) {
    clearTimeout(recordingTimer);
    recordingTimer = null;
  }
  
  // ストリームをクリーンアップ（スクリーン）
  if (screenVideo.srcObject) {
    screenVideo.srcObject.getTracks().forEach(track => {
      track.stop();
      console.log(`トラック ${track.kind} が停止されました`);
    });
    screenVideo.srcObject = null;
  }
  
  // ストリームをクリーンアップ（カメラ）
  if (cameraVideo.srcObject) {
    cameraVideo.srcObject.getTracks().forEach(track => {
      track.stop();
      console.log(`トラック ${track.kind} が停止されました`);
    });
    cameraVideo.srcObject = null;
  }
}

async function startRecording() {
  try {
    // 録画開始前に既存のストリームとデータをクリア
    cleanupResources();
    recordedBlobs = [];
    
    // UI更新
    statusBar.classList.add('recording');
    
    // ユーザーにスクリーン共有を依頼
    logStatus('スクリーン共有を選択してください...');
    screenStream = await navigator.mediaDevices.getDisplayMedia({ 
      video: { cursor: "always" },
      audio: false
    });
    
    // カメラと音声のストリームを取得
    logStatus('カメラへのアクセス準備中...');
    cameraStream = await navigator.mediaDevices.getUserMedia({ 
      video: { width: 320, height: 240, facingMode: 'user' }, 
      audio: true 
    });
    
    logStatus('録画中...');
    
    // 録画開始時間を記録
    recordingStartTime = new Date();
    
    // 録画時間を更新する関数
    function updateRecordingTime() {
      if (!recordingStartTime) return;
      
      const now = new Date();
      const diff = now - recordingStartTime;
      const seconds = Math.floor(diff / 1000) % 60;
      const minutes = Math.floor(diff / 60000);
      
      const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      logStatus(`録画中... ${formattedTime}`);
      
      recordingTimer = setTimeout(updateRecordingTime, 1000);
    }
    
    // 録画時間の更新を開始
    updateRecordingTime();
    
    // スクリーン共有の停止を検知するイベントリスナー
    screenStream.getVideoTracks()[0].addEventListener('ended', () => {
      logStatus('スクリーン共有が停止されました');
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        stopRecording();
      }
    });

    // ビデオ要素にストリームを設定
    screenVideo.srcObject = screenStream;
    screenVideo.style.display = 'block';
    
    cameraVideo.srcObject = cameraStream;
    cameraContainer.style.display = 'block'; // カメラコンテナを表示
    
    replayVideo.style.display = 'none';
    
    // キャンバスを作成
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // キャンバスサイズを設定 (画面の解像度に基づく)
    const track = screenStream.getVideoTracks()[0];
    const settings = track.getSettings();
    canvas.width = settings.width || 1920;
    canvas.height = settings.height || 1080;
    
    console.log(`キャンバスサイズ: ${canvas.width}x${canvas.height}`);
    
    // カメラサイズと位置の設定 - これはキャンバス用（録画時のみ使用）
    const cameraWidth = Math.floor(canvas.width / 5); // 画面の1/5の幅
    const cameraHeight = Math.floor(cameraWidth * 3 / 4); // 4:3のアスペクト比
    const cameraX = canvas.width - cameraWidth - 20; // 右端から20px内側
    const cameraY = canvas.height - cameraHeight - 20; // 下端から20px内側
    
    // キャンバスに描画する関数
    function drawVideoToCanvas() {
      try {
        // スクリーンビデオにデータがあるか確認
        if (screenVideo.readyState >= 2) { // HAVE_CURRENT_DATA以上
          // スクリーン映像を描画
          ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);
        }
        
        // カメラビデオにデータがあるか確認
        if (cameraVideo.readyState >= 2) { // HAVE_CURRENT_DATA以上
          // カメラ映像を右下に小さく描画
          ctx.drawImage(cameraVideo, cameraX, cameraY, cameraWidth, cameraHeight);
          
          // カメラ枠を描画
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 2;
          ctx.strokeRect(cameraX, cameraY, cameraWidth, cameraHeight);
        }
      } catch (e) {
        console.error('キャンバス描画エラー:', e);
      }
      
      // 引き続きアニメーションを続ける（停止まで）
      animationFrameId = requestAnimationFrame(drawVideoToCanvas);
    }
    
    // 描画開始
    drawVideoToCanvas();
    
    // キャンバスをストリームとして取得
    const captureStream = canvas.captureStream(30);
    
    // 音声用のストリームを作成
    const audioStream = new MediaStream(cameraStream.getAudioTracks());
    
    // キャプチャストリームと音声ストリームを結合する
    const stream = new MediaStream([...captureStream.getVideoTracks(), ...audioStream.getAudioTracks()]);
    
    // 互換性のあるMIMEタイプを見つける
    let options = { mimeType: 'video/webm;codecs=vp9,opus' };
    
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      console.log(`${options.mimeType}はサポートされていません。VP8を試します...`);
      options = { mimeType: 'video/webm;codecs=vp8,opus' };
      
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.log(`${options.mimeType}もサポートされていません。デフォルト設定を使用します...`);
        options = { mimeType: 'video/webm' };
      }
    }
    
    // MediaRecorderの設定
    mediaRecorder = new MediaRecorder(stream, options);
    
    // データが利用可能になったときのイベント
    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedBlobs.push(event.data);
      }
    };
    
    // 録画中にエラーが発生した場合
    mediaRecorder.onerror = (event) => {
      console.error('MediaRecorderエラー:', event.error);
      stopRecording();
    };
    
    // 録画開始（1秒ごとにデータチャンクを生成）
    mediaRecorder.start(1000);
    
    // ボタンの状態を更新
    startButton.disabled = true;
    stopButton.disabled = false;
    saveButton.disabled = true;
    
    // スタイルを適用
    startButton.classList.add('recording');
    
  } catch (error) {
    console.error('録画開始エラー:', error);
    alert(`録画を開始できませんでした: ${error.message}`);
    startButton.disabled = false;
    statusBar.classList.remove('recording');
    logStatus('録画準備完了');
    cleanupResources();
  }
}

function stopRecording() {
  if (!mediaRecorder || mediaRecorder.state === 'inactive') {
    logStatus('録画が既に停止しています');
    return;
  }
  
  logStatus('録画を停止しています...');
  
  try {
    // 録画タイマーを停止
    if (recordingTimer) {
      clearTimeout(recordingTimer);
      recordingTimer = null;
    }
    recordingStartTime = null;
    
    // UIの状態を更新
    statusBar.classList.remove('recording');
    startButton.classList.remove('recording');
    
    // アニメーションフレームをキャンセル
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    
    // データチャンクが利用可能になったときの処理を追加
    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedBlobs.push(event.data);
      }
    };
    
    // mediaRecorder.stopを呼び出す前にイベントハンドラを設定
    mediaRecorder.onstop = () => {
      console.log('MediaRecorder停止イベント発生');
      
      // 既存のビデオトラックを停止（トラック停止だけで固まる場合があるので慎重に）
      try {
        // カメラコンテナとビデオを非表示
        cameraContainer.style.display = 'none';
        
        // トラックを停止
        if (screenStream) {
          screenStream.getTracks().forEach(track => {
            try {
              track.stop();
              console.log(`スクリーントラック ${track.kind} が停止されました`);
            } catch (e) {
              console.error(`スクリーントラック停止エラー: ${e.message}`);
            }
          });
        }
        
        if (cameraStream) {
          cameraStream.getTracks().forEach(track => {
            try {
              track.stop();
              console.log(`カメラトラック ${track.kind} が停止されました`);
            } catch (e) {
              console.error(`カメラトラック停止エラー: ${e.message}`);
            }
          });
        }
        
        // ストリーム参照をクリア
        screenVideo.srcObject = null;
        cameraVideo.srcObject = null;
        screenStream = null;
        cameraStream = null;
      } catch (e) {
        console.error('トラック停止エラー:', e);
      }
      
      // ビデオを再生
      setTimeout(() => {
        prepareReplay();
        
        // ボタンの状態を更新
        startButton.disabled = false;
        stopButton.disabled = true;
      }, 500); // 少し遅延を入れてトラック停止処理が完了するのを待つ
    };
    
    // 録画停止 - エラーをキャッチできるようにtry-catchでラップ
    try {
      mediaRecorder.stop();
    } catch (error) {
      console.error('MediaRecorder.stop() エラー:', error);
      // エラーが発生した場合でも続行できるようにする
      cleanupResources();
      prepareReplay();
      startButton.disabled = false;
      stopButton.disabled = true;
    }
    
  } catch (error) {
    console.error('録画停止エラー:', error);
    alert(`録画の停止中にエラーが発生しました: ${error.message}`);
    
    // エラーからの回復を試みる
    startButton.disabled = false;
    stopButton.disabled = true;
    statusBar.classList.remove('recording');
    
    // 強制的にリソースを解放
    cleanupResources();
    
    logStatus('録画準備完了');
  }
}

function prepareReplay() {
  if (recordedBlobs.length === 0) {
    logStatus('再生するデータがありません');
    alert('録画データがありません。');
    return;
  }
  
  try {
    // 録画データサイズを計算 (MB)
    const totalSize = recordedBlobs.reduce((size, blob) => size + blob.size, 0) / (1024 * 1024);
    const roundedSize = Math.round(totalSize * 10) / 10;
    
    // BlobからURLを作成
    const blob = new Blob(recordedBlobs, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    
    // ビデオ要素を設定
    replayVideo.src = url;
    replayVideo.style.display = 'block';
    replayVideo.controls = true;
    
    // 自動再生の設定
    replayVideo.onloadedmetadata = () => {
      replayVideo.play().catch(e => {
        console.log('自動再生が許可されていません:', e);
      });
    };
    
    // エラーハンドリング
    replayVideo.onerror = (e) => {
      console.error('ビデオ再生エラー:', e);
      alert('録画の再生中にエラーが発生しました。');
    };
    
    // キャプチャビデオを非表示
    screenVideo.style.display = 'none';
    cameraContainer.style.display = 'none';
    
    // 保存ボタンを有効化
    saveButton.disabled = false;
    
    logStatus(`録画完了 (${roundedSize}MB) - 再生中...`);
    
  } catch (error) {
    console.error('再生準備エラー:', error);
    alert(`録画の再生準備中にエラーが発生しました: ${error.message}`);
    logStatus('録画準備完了');
  }
}

function saveRecording() {
  if (recordedBlobs.length === 0) {
    alert('保存するデータがありません。録画を行ってください。');
    return;
  }
  
  try {
    // 保存前にUIを更新
    saveButton.disabled = true;
    saveButton.innerHTML = '<i class="material-icons">hourglass_top</i>処理中...';
    
    // BlobからURLを作成
    const blob = new Blob(recordedBlobs, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    
    // データサイズを計算
    const fileSizeMB = Math.round((blob.size / (1024 * 1024)) * 10) / 10;
    
    // 保存用のリンク要素を作成
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    
    // タイムスタンプ付きのファイル名を設定
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    a.download = `screen-camera-recording-${timestamp}.webm`;
    
    // リンクをクリックして保存
    document.body.appendChild(a);
    a.click();
    
    // リソースを解放
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      logStatus(`録画を保存しました (${fileSizeMB}MB)`);
      saveButton.innerHTML = '<i class="material-icons">save_alt</i>動画保存';
      saveButton.disabled = false;
    }, 800);
    
  } catch (error) {
    console.error('保存エラー:', error);
    alert(`録画の保存中にエラーが発生しました: ${error.message}`);
    saveButton.innerHTML = '<i class="material-icons">save_alt</i>動画保存';
    saveButton.disabled = false;
  }
}

// ブラウザが閉じられる前にリソースをクリーンアップ
window.addEventListener('beforeunload', () => {
  // 録画中なら停止
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    try {
      mediaRecorder.stop();
    } catch (e) {
      console.error('MediaRecorder停止エラー:', e);
    }
  }
  
  // リソースをクリーンアップ
  cleanupResources();
});

// イベントリスナーの設定
startButton.addEventListener('click', startRecording);
stopButton.addEventListener('click', stopRecording);
saveButton.addEventListener('click', saveRecording);

// 初期状態の設定
stopButton.disabled = true;
saveButton.disabled = true;

// デバッグ情報
logStatus('録画準備完了');