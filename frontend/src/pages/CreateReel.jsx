import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export default function CreateReel() {
  const videoRef = useRef(null);
  const socketRef = useRef(null);
  const streamRef = useRef(null);
  const peerRef = useRef(null);
  const viewerReadyRef = useRef(false);

  const [cameraActive, setCameraActive] = useState(false);
  const [connected, setConnected] = useState(false);
  const [viewerConnected, setViewerConnected] = useState(false);
  const [error, setError] = useState("");

  const createPeerConnection = () => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    peer.onicecandidate = (event) => {
      if (event.candidate && socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: "ice-candidate", candidate: event.candidate }));
      }
    };
    peer.onconnectionstatechange = () => {
      if (peer.connectionState === "failed" || peer.connectionState === "disconnected" || peer.connectionState === "closed") {
        setViewerConnected(false);
      }
    };
    peerRef.current = peer;
    return peer;
  };

  const createOffer = async () => {
    const stream = streamRef.current;
    if (!stream || socketRef.current?.readyState !== WebSocket.OPEN) return;

    if (peerRef.current) peerRef.current.close();
    const peer = createPeerConnection();

    stream.getTracks().forEach((track) => peer.addTrack(track, stream));
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    socketRef.current.send(JSON.stringify({ type: "offer", offer }));
  };

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    socketRef.current = socket;

    socket.onopen = () => {
      setConnected(true);
      setError("");
      socket.send(JSON.stringify({ type: "client" }));
    };

    socket.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "viewer-ready") {
          viewerReadyRef.current = true;
          setViewerConnected(true);
          if (streamRef.current) await createOffer();
        } else if (data.type === "answer" && peerRef.current) {
          await peerRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        } else if (data.type === "ice-candidate" && peerRef.current && data.candidate) {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        } else if (data.type === "viewer-disconnected") {
          viewerReadyRef.current = false;
          setViewerConnected(false);
        }
      } catch (err) {
        console.error("Signaling error:", err);
      }
    };

    socket.onclose = () => {
      setConnected(false);
      setViewerConnected(false);
    };

    return () => socket.close();
  }, []);

  const startCamera = async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;

      const video = videoRef.current;
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;
      await video.play();

      setCameraActive(true);

      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: "capture-ready" }));
      }

      if (viewerReadyRef.current) {
        await createOffer();
      }
    } catch (err) {
      if (err.name === "NotAllowedError") {
        setError("Camera or microphone permission was denied.");
      } else {
        setError("Could not access camera or microphone.");
      }
    }
  };

  const stopCamera = () => {
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setViewerConnected(false);
    viewerReadyRef.current = false;
  };

  return (
    <div className="ig-app">
      {/* Sidebar */}
      <aside className="ig-sidebar">
        <Link to="/" className="ig-logo">
          Instagram
        </Link>
        <nav className="ig-nav">
          <Link to="/" className="ig-nav-item">
            <span className="ig-nav-icon">🏠</span>
            <span>Home</span>
          </Link>
          <button className="ig-nav-item">
            <span className="ig-nav-icon">🔍</span>
            <span>Search</span>
          </button>
          <button className="ig-nav-item">
            <span className="ig-nav-icon">🧭</span>
            <span>Explore</span>
          </button>
          <Link to="/viewer" className="ig-nav-item">
            <span className="ig-nav-icon">▶</span>
            <span>Reels</span>
          </Link>
          <button className="ig-nav-item">
            <span className="ig-nav-icon">💬</span>
            <span>Messages</span>
          </button>
          <button className="ig-nav-item">
            <span className="ig-nav-icon">♡</span>
            <span>Notifications</span>
          </button>
          <Link to="/create" className="ig-nav-item active">
            <span className="ig-nav-icon">➕</span>
            <span>Create</span>
          </Link>
          <button className="ig-nav-item">
            <span className="ig-nav-icon">👤</span>
            <span>Profile</span>
          </button>
        </nav>
        <div className="ig-sidebar-bottom">
          <button className="ig-nav-item">
            <span className="ig-nav-icon">☰</span>
            <span>More</span>
          </button>
        </div>
      </aside>

      {/* Create Main Section */}
      <main className="create-reel-main">
        <div className="create-reel-header">
          <div>
            <h1>Create new reel</h1>
            <p>Capture live camera and audio stream for your audience.</p>
          </div>
          <div className="create-connection">
            <span className={connected ? "create-status-dot online" : "create-status-dot"} />
            {connected ? "Server connected" : "Connecting"}
          </div>
        </div>

        <section className="create-card">
          <div className="create-card-header">
            <div className="create-user">
              <div className="create-avatar">MT</div>
              <div>
                <strong>_mian.talha_</strong>
                <span>New Reel Broadcast</span>
              </div>
            </div>
            <button className="create-more">•••</button>
          </div>

          <div className="create-camera">
            <video ref={videoRef} autoPlay playsInline muted />
            {!cameraActive && (
              <div className="create-camera-empty">
                <div className="camera-big-icon">📷</div>
                <h2>Camera Preview</h2>
                <p>Start your camera and microphone to broadcast your live reel.</p>
              </div>
            )}
            {cameraActive && (
              <div className="camera-live-badge">
                <span>●</span> LIVE
              </div>
            )}
          </div>

          {error && <div className="create-error">{error}</div>}

          <div className="create-controls">
            {!cameraActive ? (
              <button className="start-camera-button" onClick={startCamera}>
                <span>▶</span> Start Camera + Microphone
              </button>
            ) : (
              <button className="stop-camera-button" onClick={stopCamera}>
                <span>⏹</span> Stop Camera + Microphone
              </button>
            )}
          </div>

          <div className="create-status-grid">
            <div className="create-status-card">
              <span className="status-card-icon">📹</span>
              <div>
                <span>Camera</span>
                <strong className={cameraActive ? "status-active" : ""}>
                  {cameraActive ? "Active" : "Off"}
                </strong>
              </div>
            </div>
            <div className="create-status-card">
              <span className="status-card-icon">🎤</span>
              <div>
                <span>Microphone</span>
                <strong className={cameraActive ? "status-active" : ""}>
                  {cameraActive ? "Active" : "Off"}
                </strong>
              </div>
            </div>

          </div>
        </section>
      </main>

      {/* Right Sidebar */}
      <aside className="ig-right create-right">
        <div className="create-right-profile">
          <div className="ig-profile-avatar">MT</div>
          <div className="ig-profile-info">
            <strong>_mian.talha_</strong>
            <span>Muhammad Talha</span>
          </div>
        </div>
        <div className="create-right-heading">Your Session Status</div>
        <div className="ig-footer">
          About · Help · Privacy · Terms · API · Locations <br />
          <p>© 2026 INSTAGRAM FROM META</p>
        </div>
      </aside>
    </div>
  );
}