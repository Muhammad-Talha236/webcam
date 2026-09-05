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

    if (peerRef.current) {
      peerRef.current.close();
    }

    const peer = createPeerConnection();
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    socketRef.current.send(JSON.stringify({ type: "offer", offer }));
  };

  useEffect(() => {
    const SIGNALING_URL = import.meta.env.VITE_SIGNALING_URL || "ws://localhost:8080";
    const socket = new WebSocket(SIGNALING_URL);
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
          if (streamRef.current) {
            await createOffer();
          }
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
      if (video) {
        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;
        video.autoplay = true;
        await video.play();
      }

      setCameraActive(true);

      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: "capture-ready" }));
      }

      if (streamRef.current) {
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
  };return (
    <div className="min-h-screen bg-black text-white flex justify-center gap-10 max-w-7xl mx-auto px-4">
      {/* Sidebar */}
      <aside className="sticky top-0 h-screen w-60 border-r border-neutral-800 hidden md:flex flex-col p-6 z-50">
        <Link to="/" className="text-2xl font-bold tracking-tight mb-8">
          Instagram
        </Link>
        <nav className="flex flex-col gap-2">
          <Link to="/" className="flex items-center gap-4 p-3 rounded-xl hover:bg-neutral-900 transition">
            <span className="text-xl">🏠</span>
            <span className="text-sm font-medium">Home</span>
          </Link>
          <button className="flex items-center gap-4 p-3 rounded-xl hover:bg-neutral-900 transition">
            <span className="text-xl">🔍</span>
            <span className="text-sm font-medium">Search</span>
          </button>
          <button className="flex items-center gap-4 p-3 rounded-xl hover:bg-neutral-900 transition">
            <span className="text-xl">🧩</span>
            <span className="text-sm font-medium">Explore</span>
          </button>
          <Link to="/viewer" className="flex items-center gap-4 p-3 rounded-xl hover:bg-neutral-900 transition">
            <span className="text-xl">🎬</span>
            <span className="text-sm font-medium">Reels</span>
          </Link>
          <button className="flex items-center gap-4 p-3 rounded-xl hover:bg-neutral-900 transition">
            <span className="text-xl">💬</span>
            <span className="text-sm font-medium">Messages</span>
          </button>
          <button className="flex items-center gap-4 p-3 rounded-xl hover:bg-neutral-900 transition">
            <span className="text-xl">❤️</span>
            <span className="text-sm font-medium">Notifications</span>
          </button>
          <Link to="/create" className="flex items-center gap-4 p-3 rounded-xl bg-neutral-900 font-bold">
            <span className="text-xl">➕</span>
            <span className="text-sm font-medium">Create</span>
          </Link>
          <button className="flex items-center gap-4 p-3 rounded-xl hover:bg-neutral-900 transition">
            <span className="text-xl">👤</span>
            <span className="text-sm font-medium">Profile</span>
          </button>
        </nav>
        <div className="mt-auto">
          <button className="flex items-center gap-4 p-3 w-full rounded-xl hover:bg-neutral-900 transition">
            <span className="text-xl">🍔</span>
            <span className="text-sm font-medium">More</span>
          </button>
        </div>
      </aside>

      {/* Create Main Section */}
      <main className="flex-1 py-8 max-w-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create new reel</h1>
            <p className="text-xs text-neutral-400 mt-1">Capture live camera and audio stream for your audience.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
            <span className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-neutral-600"}`} />
            {connected ? "Server connected" : "Connecting"}
          </div>
        </div>

        <section className="border border-neutral-800 bg-neutral-950 rounded-2xl overflow-hidden p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 flex items-center justify-center font-extrabold text-sm">MT</div>
              <div>
                <strong className="block text-sm font-semibold">_mian.talha_</strong>
                <span className="text-xs text-neutral-400">New Reel Broadcast</span>
              </div>
            </div>
            <button className="text-neutral-400 hover:text-white">•••</button>
          </div>

          <div className="relative aspect-[4/5] bg-black rounded-xl overflow-hidden border border-neutral-800 flex items-center justify-center">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover -scale-x-100" />
            {!cameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-neutral-950/90">
                <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center text-3xl mb-4 text-neutral-300">📷</div>
                <h2 className="text-lg font-bold">Camera Preview</h2>
                <p className="text-xs text-neutral-400 max-w-xs mt-1">Start your camera and microphone to broadcast your live reel.</p>
              </div>
            )}
            {cameraActive && (
              <div className="absolute top-4 left-4 bg-rose-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-md tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" /> LIVE
              </div>
            )}
          </div>

          {error && <div className="p-3 bg-red-950/40 border border-red-800 text-red-400 rounded-xl text-xs text-center">{error}</div>}

          <div className="flex justify-center">
            {!cameraActive ? (
              <button className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600 font-bold text-sm rounded-xl hover:opacity-90 transition shadow-lg" onClick={startCamera}>
                Start Camera + Microphone
              </button>
            ) : (
              <button className="w-full py-3.5 px-6 bg-neutral-900 border border-neutral-700 font-bold text-sm rounded-xl hover:bg-neutral-800 transition" onClick={stopCamera}>
                Stop Camera + Microphone
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 border border-neutral-800 bg-neutral-900/40 rounded-xl flex items-center gap-3">
              <span className="text-lg">🎥</span>
              <div>
                <span className="block text-[10px] text-neutral-500 uppercase font-semibold">Camera</span>
                <strong className={`text-xs ${cameraActive ? "text-emerald-400" : "text-neutral-400"}`}>
                  {cameraActive ? "Active" : "Off"}
                </strong>
              </div>
            </div>
            <div className="p-3 border border-neutral-800 bg-neutral-900/40 rounded-xl flex items-center gap-3">
              <span className="text-lg">🎙️</span>
              <div>
                <span className="block text-[10px] text-neutral-500 uppercase font-semibold">Microphone</span>
                <strong className={`text-xs ${cameraActive ? "text-emerald-400" : "text-neutral-400"}`}>
                  {cameraActive ? "Active" : "Off"}
                </strong>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Right Sidebar */}
      <aside className="sticky top-0 h-screen w-80 pt-8 hidden lg:block">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 flex items-center justify-center font-extrabold text-base">MT</div>
          <div>
            <strong className="block text-sm font-semibold">_mian.talha_</strong>
            <span className="text-xs text-neutral-400">Muhammad Talha</span>
          </div>
        </div>
        <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-4">Your Session Status</div>
        <div className="text-[11px] text-neutral-500 leading-relaxed">
          About • Help • Privacy • Terms • API • Locations
          <p className="mt-4 font-mono text-[10px]">© 2026 INSTAGRAM FROM META</p>
        </div>
      </aside>
    </div>
  );
}