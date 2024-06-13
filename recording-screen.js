const screenVideo = document.getElementById('screenVideo');
const cameraVideo = document.getElementById('cameraVideo');
const replayVideo = document.getElementById('replayVideo');
const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');
const saveButton = document.getElementById('save');
let mediaRecorder;
const recordedBlobs = [];

async function startRecording() {
 const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
 const cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: true });

 // video要素にstreamを入れ込む
 screenVideo.srcObject = screenStream;
 cameraVideo.srcObject = cameraStream;

 // キャンバス処理
 const canvas = document.createElement('canvas');
 const ctx = canvas.getContext('2d');
 canvas.width = 1920;
 canvas.height = 1080;

 function drawVideoToCanvas() {
   ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);
   ctx.drawImage(cameraVideo, canvas.width - 160, canvas.height - 120, 160, 120);
   requestAnimationFrame(drawVideoToCanvas);
}

 drawVideoToCanvas();

 // キャプチャしたcanvasを録画対象にする
 const captureStream = canvas.captureStream(30);

 // 音声用のストリームを作成
 const audioStream = new MediaStream(cameraStream.getAudioTracks());

 // キャプチャストリームと音声ストリームを結合する
 const stream = new MediaStream([...captureStream.getVideoTracks(), ...audioStream.getAudioTracks()]);

 //mimeTypeを設定
 const options = { mimeType: 'video/webm;codecs=vp9,opus' };

 mediaRecorder = new MediaRecorder(stream, options);
 mediaRecorder.ondataavailable = (event) => {
   if (event.data && event.data.size > 0) {
     // 録画データが格納される
     recordedBlobs.push(event.data);
   }
 };

 mediaRecorder.start();
 console.log('録画開始');
 startButton.disabled = true;
 stopButton.disabled = false;
}

function replay() {
 const blob = new Blob(recordedBlobs, { type: 'video/webm' });
 replayVideo.src = URL.createObjectURL(blob);
 replayVideo.style.display = 'block';
 replayVideo.controls = true;
 screenVideo.style.display = 'none';
 cameraVideo.style.display = 'none';
 saveButton.disabled = false;
}

function saveRecording() {
 const blob = new Blob(recordedBlobs, { type: 'video/webm' });
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.style.display = 'none';
 a.href = url;
 a.download = '録画ファイル.webm';
 document.body.appendChild(a);
 a.click();
 setTimeout(() => {
   document.body.removeChild(a);
   URL.revokeObjectURL(url);
 }, 100);
}

function stopRecording() {
 mediaRecorder.stop();
 console.log('録画停止');
 mediaRecorder.onstop = () => {
   replay();
   startButton.disabled = false;
   stopButton.disabled = true;
   recordVideo.srcObject.getTracks().forEach(track => track.stop());
   cameraVideo.srcObject.getTracks().forEach(track => track.stop());
 };
}

startButton.addEventListener('click', () => {
 startRecording();
 startButton.disabled = true;
 stopButton.disabled = false;
});

stopButton.addEventListener('click', stopRecording);
saveButton.addEventListener('click', saveRecording);