// Sender (Noutbuk / Telefon) JavaScript - Ultra Fast 60fps & WebRTC Streaming Engine
let ws = null;
let roomCode = null;
let peerConnection = null;
let localStream = null;
let currentMode = 'duplicate';

let candidateQueue = [];
let isRemoteDescriptionSet = false;

// STUN + Free OpenRelay TURN servers for global cross-network & CGNAT connectivity
const rtcConfig = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun.cloudflare.com:3478' },
        {
            urls: 'turn:openrelay.metered.ca:80',
            username: 'openrelayproject',
            credential: 'openrelayproject'
        },
        {
            urls: 'turn:openrelay.metered.ca:443',
            username: 'openrelayproject',
            credential: 'openrelayproject'
        },
        {
            urls: 'turn:openrelay.metered.ca:443?transport=tcp',
            username: 'openrelayproject',
            credential: 'openrelayproject'
        }
    ],
    iceCandidatePoolSize: 10
};

// UI Elements
const joinCodeInput = document.getElementById('joinCode');
const btnJoin = document.getElementById('btnJoin');
const connectStatus = document.getElementById('connectStatus');
const connectionBox = document.getElementById('connectionBox');
const controlPanel = document.getElementById('controlPanel');
const activeRoomCode = document.getElementById('activeRoomCode');

const btnStartStream = document.getElementById('btnStartStream');
const btnStartCamera = document.getElementById('btnStartCamera');
const btnStopStream = document.getElementById('btnStopStream');
const streamStatusIndicator = document.getElementById('streamStatusIndicator');

const localPreviewContainer = document.getElementById('localPreviewContainer');
const localPreview = document.getElementById('localPreview');
const btnTogglePreview = document.getElementById('btnTogglePreview');

// 3 Modes Elements
const modeDuplicate = document.getElementById('modeDuplicate');
const modeExtend = document.getElementById('modeExtend');
const modeStandby = document.getElementById('modeStandby');
const extendSubPanel = document.getElementById('extendSubPanel');
const btnPickSlideWindow = document.getElementById('btnPickSlideWindow');

const modeButtons = [
    { el: modeDuplicate, mode: 'duplicate' },
    { el: modeExtend, mode: 'extend' },
    { el: modeStandby, mode: 'standby' }
];

// Initialize WebSocket Connection
function initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${protocol}//${window.location.host}`);

    ws.onopen = () => {
        console.log('[WS] Uzatuvchi serverga ulandi.');
        
        // Auto-join from URL parameter (e.g. from QR code scan: sender.html?code=XXXXXX)
        checkUrlForRoomCode();
    };

    ws.onmessage = (event) => {
        try {
            const msg = JSON.parse(event.data);
            handleServerMessage(msg);
        } catch (e) {
            console.error('WS parse error:', e);
        }
    };

    ws.onclose = () => {
        connectStatus.innerText = '❌ Server bilan aloqa uzildi. Qayta yuklanmoqda...';
        connectStatus.style.color = 'var(--danger)';
    };
}

initWebSocket();

function checkUrlForRoomCode() {
    const urlParams = new URLSearchParams(window.location.search);
    const codeParam = urlParams.get('code') || urlParams.get('room');
    if (codeParam && codeParam.trim().length === 6) {
        joinCodeInput.value = codeParam.trim();
        setTimeout(() => {
            btnJoin.click();
        }, 400);
    }
}

// Handle Join
btnJoin.addEventListener('click', () => {
    const code = joinCodeInput.value.trim();
    if (!code || code.length < 6) {
        connectStatus.innerText = typeof t === 'function' ? t('err_invalid_code') : '⚠️ Iltimos, 6 xonali ulanish parolini to‘liq kiriting!';
        connectStatus.style.color = 'var(--warning)';
        return;
    }

    connectStatus.innerText = typeof t === 'function' ? t('status_connecting') : '⏳ Ulash kutilmoqda...';
    connectStatus.style.color = 'var(--text-muted)';

    ws.send(JSON.stringify({
        type: 'join_room',
        code: code
    }));
});

// Handle Server Messages
function handleServerMessage(msg) {
    switch (msg.type) {
        case 'room_joined':
            roomCode = msg.code;
            connectStatus.innerText = '✅ OK';
            connectionBox.style.display = 'none';
            controlPanel.style.display = 'block';
            activeRoomCode.innerText = `Code: ${roomCode}`;

            initPeerConnection();
            break;

        case 'error':
            connectStatus.innerText = `❌ ${msg.message}`;
            connectStatus.style.color = 'var(--danger)';
            break;

        case 'signal':
            handleSignal(msg.data);
            break;

        case 'mode_changed':
            currentMode = msg.mode;
            setUiActiveMode(msg.mode);
            break;

        case 'display_disconnected':
            alert('⚠️ Elektron doska aloqadan uzildi.');
            location.reload();
            break;
    }
}

// 3 Modes Selection Handlers
modeButtons.forEach(({ el, mode }) => {
    if (el) {
        el.addEventListener('click', () => {
            switchMode(mode);
        });
    }
});

function switchMode(mode) {
    currentMode = mode;
    setUiActiveMode(mode);

    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'change_mode',
            mode: mode
        }));
    }
}

function setUiActiveMode(mode) {
    modeButtons.forEach(({ el, mode: m }) => {
        if (el) {
            if (m === mode) el.classList.add('active');
            else el.classList.remove('active');
        }
    });

    if (extendSubPanel) {
        extendSubPanel.style.display = (mode === 'extend') ? 'block' : 'none';
    }
}

// Extend mode: Pick Presentation / Slide Window (PowerPoint, Canva, Google Slides)
if (btnPickSlideWindow) {
    btnPickSlideWindow.addEventListener('click', async () => {
        try {
            let slideStream = null;
            try {
                slideStream = await navigator.mediaDevices.getDisplayMedia({
                    video: {
                        displaySurface: "window"
                    },
                    audio: false
                });
            } catch (e1) {
                slideStream = await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                    audio: false
                });
            }

            if (slideStream) {
                await applyStream(slideStream);
            }
        } catch (err) {
            console.log('Slayd oynasi tanlanmadi:', err);
        }
    });
}

// WebRTC Peer Connection Initialization
function initPeerConnection() {
    if (peerConnection) {
        try { peerConnection.close(); } catch (e) {}
    }

    candidateQueue = [];
    isRemoteDescriptionSet = false;

    peerConnection = new RTCPeerConnection(rtcConfig);

    peerConnection.onicecandidate = (event) => {
        if (event.candidate && ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'signal',
                data: { candidate: event.candidate }
            }));
        }
    };

    peerConnection.onconnectionstatechange = () => {
        console.log('[Sender WebRTC State]', peerConnection.connectionState);
    };
}

async function handleSignal(data) {
    if (!peerConnection || peerConnection.connectionState === 'closed') {
        initPeerConnection();
    }

    try {
        if (data.sdp) {
            const desc = new RTCSessionDescription(data.sdp);
            await peerConnection.setRemoteDescription(desc);
            isRemoteDescriptionSet = true;

            // Flush any queued candidates
            while (candidateQueue.length > 0) {
                const candidate = candidateQueue.shift();
                try {
                    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (e) {
                    console.warn('Queued candidate error:', e);
                }
            }

            if (desc.type === 'offer') {
                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                        type: 'signal',
                        data: { sdp: peerConnection.localDescription }
                    }));
                }
            }
        } else if (data.candidate) {
            if (isRemoteDescriptionSet && peerConnection.remoteDescription) {
                try {
                    await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
                } catch (err) {
                    console.warn('addIceCandidate error:', err);
                }
            } else {
                candidateQueue.push(data.candidate);
            }
        }
    } catch (err) {
        console.error('Error handling signal in sender:', err);
    }
}

// Function to apply video stream to both local preview and WebRTC peer connection
async function applyStream(stream) {
    if (localStream) {
        localStream.getTracks().forEach(t => t.stop());
    }
    localStream = stream;

    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) {
        alert("⚠️ Video oqimi topilmadi.");
        return;
    }

    if ('contentHint' in videoTrack) {
        videoTrack.contentHint = 'motion';
    }

    // Show live preview on sender
    if (localPreview) {
        localPreview.srcObject = localStream;
        localPreviewContainer.style.display = 'block';
    }

    videoTrack.onended = () => {
        stopScreenSharing();
    };

    btnStartStream.style.display = 'none';
    if (btnStartCamera) btnStartCamera.style.display = 'none';
    btnStopStream.style.display = 'inline-flex';
    streamStatusIndicator.style.display = 'block';

    // Ensure peerConnection is ready
    if (!peerConnection || peerConnection.connectionState === 'closed') {
        initPeerConnection();
    }

    // Add or replace track on peerConnection
    const senders = peerConnection.getSenders();
    const videoSender = senders.find(s => s.track && s.track.kind === 'video');

    if (videoSender) {
        await videoSender.replaceTrack(videoTrack);
    } else {
        peerConnection.addTrack(videoTrack, localStream);
    }

    try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'signal',
                data: { sdp: peerConnection.localDescription }
            }));
        }
    } catch (err) {
        console.error("Error creating/sending offer:", err);
    }
}

// START Screen Share (PC / Android)
btnStartStream.addEventListener('click', async () => {
    await startScreenShare();
});

async function startScreenShare() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        alert("⚠️ Brauzeringizda to'g'ridan-to'g'ri ekran uzatish qo'llab-quvvatlanmaydi.\n\nAgar telefoningizda bo'lsangiz, '📷 Kamera orqali uzatish' tugmasidan foydalaning!");
        return;
    }

    let stream = null;
    try {
        stream = await navigator.mediaDevices.getDisplayMedia({
            video: {
                cursor: "always"
            },
            audio: false
        });
    } catch (err1) {
        console.warn("First getDisplayMedia failed, trying minimal constraints:", err1);
        try {
            stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: false
            });
        } catch (err2) {
            console.error("Screen share error:", err2);
            if (err2.name === 'NotAllowedError' || err2.name === 'PermissionDeniedError') {
                alert("⚠️ Ekran uzatish bekor qilindi yoki ruxsat berilmadi.");
            } else {
                alert("⚠️ Ekran uzatishda xatolik yuz berdi: " + (err2.message || err2.name));
            }
            return;
        }
    }

    if (stream) {
        await applyStream(stream);
    }
}

// START Mobile Phone Camera Share
if (btnStartCamera) {
    btnStartCamera.addEventListener('click', async () => {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                alert("⚠️ Ushbu brauzerda kameraga ulanish qo'llab-quvvatlanmaydi.");
                return;
            }

            let stream = null;
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: { ideal: "environment" },
                        width: { ideal: 1920 },
                        height: { ideal: 1080 }
                    },
                    audio: false
                });
            } catch (e1) {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false
                });
            }

            if (stream) {
                await applyStream(stream);
            }
        } catch (err) {
            console.error('Kamera ochishda xatolik:', err);
            alert('⚠️ Kameraga ulanishga ruxsat berilmadi yoki kamera boshqa ilova tomonidan band.');
        }
    });
}

// Toggle Live Preview Visibility
if (btnTogglePreview) {
    btnTogglePreview.addEventListener('click', () => {
        if (localPreview.style.display === 'none') {
            localPreview.style.display = 'block';
            btnTogglePreview.innerText = 'Yashirish';
        } else {
            localPreview.style.display = 'none';
            btnTogglePreview.innerText = 'Ko\'rsatish';
        }
    });
}

// STOP Streaming
btnStopStream.addEventListener('click', () => {
    stopScreenSharing();
});

function stopScreenSharing() {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }

    if (localPreview) {
        localPreview.srcObject = null;
    }
    if (localPreviewContainer) {
        localPreviewContainer.style.display = 'none';
    }

    btnStartStream.style.display = 'inline-flex';
    if (btnStartCamera) btnStartCamera.style.display = 'inline-flex';
    btnStopStream.style.display = 'none';
    streamStatusIndicator.style.display = 'none';
}
