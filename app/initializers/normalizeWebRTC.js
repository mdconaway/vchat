export function initialize() {  //(registry, application) available if needed
    window.RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
    window.RTCIceCandidate = window.RTCIceCandidate || window.webkitRTCIceCandidate || window.mozRTCIceCandidate;
    window.RTCSessionDescription = window.RTCSessionDescription || window.webkitRTCSessionDescription|| window.mozRTCSessionDescription;
    window.URL = window.URL || window.webkitURL || window.mozURL;
    window.navigator.getUserMedia = window.navigator.getUserMedia || window.navigator.webkitGetUserMedia || window.navigator.mozGetUserMedia || navigator.msGetUserMedia;
}

export default {
  name: 'normalizeWebRTC',
  initialize: initialize
};