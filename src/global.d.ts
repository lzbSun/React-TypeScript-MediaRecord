declare var MediaRecorder: any;
declare module 'wavesurfer.js/dist/plugin/wavesurfer.microphone.js';
interface HTMLMediaElement {
    captureStream(): MediaStream
}