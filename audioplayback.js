let playSocket = new WebSocket("ws://236b-197-3-6-252.ngrok-free.app:83");
let audioCtx = new (window.AudioContext || window.webkitAudioContext)();

playSocket.binaryType = 'arraybuffer';
playSocket.onmessage = (event) => {
  audioCtx.decodeAudioData(event.data).then(buffer => {
    let source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    source.start();
  });
};
