let audioSocket = new WebSocket("ws://[ESP32-IP]:82");
navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
  const recorder = new MediaRecorder(stream);
  recorder.ondataavailable = (e) => {
    audioSocket.send(e.data);
  };
  recorder.start(100);
});