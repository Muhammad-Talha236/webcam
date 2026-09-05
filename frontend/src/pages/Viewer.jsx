import { useEffect, useRef, useState } from "react";

const SIGNALING_URL = import.meta.env.VITE_SIGNALING_URL || "ws://localhost:8080";
function Viewer() {
  const videoRef = useRef(null);
  const socketRef = useRef(null);
  const peerRef = useRef(null);
  const pendingIceRef = useRef([]);

  const [connected, setConnected] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [webRTCState, setWebRTCState] = useState("waiting");
  const [videoActive, setVideoActive] = useState(false);
  const [audioActive, setAudioActive] = useState(false);
  const [error, setError] = useState("");
  const [events, setEvents] = useState([]);

  const addEvent = (message) => {
    const time = new Date().toLocaleTimeString();

    setEvents((previous) => [
      {
        time,
        message,
      },
      ...previous,
    ].slice(0, 8));
  };

  const sendSignal = (data) => {
    const socket = socketRef.current;

    if (
      socket &&
      socket.readyState === WebSocket.OPEN
    ) {
      socket.send(JSON.stringify(data));
      return true;
    }

    return false;
  };

  const createPeerConnection = () => {
    const peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    });

    peer.ontrack = async (event) => {
      console.log(
        "REMOTE TRACK:",
        event.track.kind
      );

      if (
        !videoRef.current ||
        !event.streams[0]
      ) {
        return;
      }

      videoRef.current.srcObject =
        event.streams[0];

      if (event.track.kind === "video") {
        setVideoActive(true);
        addEvent("Remote video track received");
      }

      if (event.track.kind === "audio") {
        setAudioActive(true);
        addEvent("Remote audio track received");
      }

      try {
        await videoRef.current.play();
      } catch (playError) {
        console.log(
          "Video playback waiting:",
          playError
        );
      }

      setStreaming(true);
      setError("");
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal({
          type: "ice-candidate",
          candidate: event.candidate,
        });
      }
    };

    peer.onconnectionstatechange = () => {
      const state = peer.connectionState;

      console.log(
        "Viewer WebRTC state:",
        state
      );

      setWebRTCState(state);

      if (state === "connected") {
        setStreaming(true);
        setError("");
        addEvent(
          "WebRTC connection established"
        );
      }

      if (
        state === "failed" ||
        state === "disconnected"
      ) {
        setStreaming(false);
        setVideoActive(false);
        setAudioActive(false);

        addEvent(
          `WebRTC connection ${state}`
        );
      }

      if (state === "closed") {
        setStreaming(false);
        setVideoActive(false);
        setAudioActive(false);
      }
    };

    peer.oniceconnectionstatechange = () => {
      console.log(
        "ICE state:",
        peer.iceConnectionState
      );
    };

    peerRef.current = peer;

    return peer;
  };

  const flushPendingIce = async (peer) => {
    const candidates =
      pendingIceRef.current;

    pendingIceRef.current = [];

    for (const candidate of candidates) {
      try {
        await peer.addIceCandidate(
          candidate
        );
      } catch (error) {
        console.error(
          "Queued ICE error:",
          error
        );
      }
    }
  };

  useEffect(() => {
    const socket =
      new WebSocket(SIGNALING_URL);

    socketRef.current = socket;

    socket.onopen = () => {
      console.log(
        "Viewer connected to signaling server"
      );

      setConnected(true);
      setError("");

      addEvent(
        "Connected to signaling server"
      );

      socket.send(
        JSON.stringify({
          type: "viewer",
        })
      );
    };

    socket.onmessage = async (event) => {
      try {
        const data =
          JSON.parse(event.data);

        console.log(
          "Viewer signaling:",
          data.type
        );

        // ----------------------------
        // Registration
        // ----------------------------

        if (data.type === "registered") {
          addEvent(
            "Viewer registered with server"
          );

          return;
        }

        // ----------------------------
        // WebRTC OFFER
        // ----------------------------

        if (data.type === "offer") {
          addEvent(
            "WebRTC offer received"
          );

          if (peerRef.current) {
            peerRef.current.close();
          }

          const peer =
            createPeerConnection();

          await peer.setRemoteDescription(
            new RTCSessionDescription(
              data.offer
            )
          );

          await flushPendingIce(peer);

          const answer =
            await peer.createAnswer();

          await peer.setLocalDescription(
            answer
          );

          sendSignal({
            type: "answer",
            answer,
          });

          addEvent(
            "WebRTC answer sent"
          );

          return;
        }

        // ----------------------------
        // ICE
        // ----------------------------

        if (
          data.type ===
          "ice-candidate"
        ) {
          if (!data.candidate) {
            return;
          }

          const candidate =
            new RTCIceCandidate(
              data.candidate
            );

          const peer =
            peerRef.current;

          if (
            peer &&
            peer.remoteDescription
          ) {
            try {
              await peer.addIceCandidate(
                candidate
              );

              console.log(
                "ICE candidate added"
              );
            } catch (error) {
              console.error(
                "ICE candidate error:",
                error
              );
            }
          } else {
            pendingIceRef.current.push(
              candidate
            );
          }

          return;
        }

        // ----------------------------
        // Capture disconnected
        // ----------------------------

        if (
          data.type ===
          "client-disconnected"
        ) {
          addEvent(
            "Capture device disconnected"
          );

          setStreaming(false);
          setVideoActive(false);
          setAudioActive(false);
          setWebRTCState("disconnected");

          if (videoRef.current) {
            videoRef.current.srcObject =
              null;
          }

          return;
        }
      } catch (error) {
        console.error(
          "Signaling error:",
          error
        );

        setError(
          "Invalid signaling message."
        );
      }
    };

    socket.onclose = () => {
      console.log(
        "Viewer signaling disconnected"
      );

      setConnected(false);
      setStreaming(false);
      setVideoActive(false);
      setAudioActive(false);

      addEvent(
        "Signaling server disconnected"
      );
    };

    socket.onerror = () => {
      console.error(
        "Viewer WebSocket error"
      );

      setError(
        "Could not connect to signaling server."
      );

      addEvent(
        "WebSocket connection error"
      );
    };

    return () => {
      socket.close();

      if (peerRef.current) {
        peerRef.current.close();
      }
    };
  }, []);

  const statusClass = (active) =>
    active
      ? "monitor-status active"
      : "monitor-status";

return (
    <div className="min-h-screen bg-[#07090e] text-slate-200 font-mono selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* HEADER */}
      <header className="h-16 border-b border-slate-800/80 bg-[#0b0f17]/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg border border-emerald-500/30 bg-emerald-500/10 grid place-items-center font-bold text-xs tracking-wider text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
            RL
          </div>
          <div>
            <h1 className="text-xs font-bold tracking-[0.2em] text-slate-100 uppercase">
              SECURE MEDIA LAB
            </h1>
            <p className="text-[9px] text-slate-500 tracking-wider">
              AUTHORIZED WEBRTC TEST ENVIRONMENT
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-xs font-medium bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800">
          <span
            className={`w-2 h-2 rounded-full ${
              connected 
                ? "bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" 
                : "bg-rose-500 shadow-[0_0_8px_#f43f5e]"
            }`}
          />
          <span className="text-[11px] tracking-wider text-slate-300">
            {connected ? "SYSTEM ONLINE" : "SYSTEM OFFLINE"}
          </span>
        </div>
      </header>

      {/* LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] min-h-[calc(100vh-64px)]">

        {/* SIDEBAR */}
        <aside className="border-r border-slate-800/60 bg-[#090d14] p-5 hidden md:block">
          <div className="text-[10px] text-slate-500 tracking-widest uppercase mb-3 font-semibold">
            MONITOR
          </div>

          <div className="space-y-1">
            <div className="h-9 rounded-md flex items-center gap-3 text-xs px-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-medium">
              <span className="text-emerald-500 font-mono">01</span> LIVE FEED
            </div>
            <div className="h-9 rounded-md flex items-center gap-3 text-xs px-3 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 cursor-pointer transition">
              <span className="text-slate-600 font-mono">02</span> CONNECTION
            </div>
            <div className="h-9 rounded-md flex items-center gap-3 text-xs px-3 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 cursor-pointer transition">
              <span className="text-slate-600 font-mono">03</span> MEDIA STATUS
            </div>
            <div className="h-9 rounded-md flex items-center gap-3 text-xs px-3 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 cursor-pointer transition">
              <span className="text-slate-600 font-mono">04</span> EVENT LOG
            </div>
          </div>

          <div className="h-px bg-slate-800/60 my-6" />

          <div className="text-[10px] text-slate-500 tracking-widest uppercase mb-3 font-semibold">
            PROTOCOL
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center bg-slate-900/40 p-2 rounded border border-slate-800/40">
              <span className="text-slate-400">WS</span>
              <b className={`font-mono ${connected ? "text-emerald-400" : "text-rose-400"}`}>
                {connected ? "CONNECTED" : "OFFLINE"}
              </b>
            </div>

            <div className="flex justify-between items-center bg-slate-900/40 p-2 rounded border border-slate-800/40">
              <span className="text-slate-400">RTC</span>
              <b className={`font-mono ${webRTCState === "connected" ? "text-emerald-400" : "text-amber-400"}`}>
                {webRTCState.toUpperCase()}
              </b>
            </div>
          </div>

          <div className="mt-20 text-[10px] text-slate-600 font-mono">
            LAB BUILD 2026.1
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="p-6 md:p-8 max-w-5xl w-full mx-auto space-y-6">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-[10px] text-emerald-400 tracking-widest uppercase font-semibold">
                MEDIA MONITOR / 01
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
                Live Capture Feed
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Authorized camera and microphone WebRTC test stream.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-md border border-slate-800">
              <span className={`w-2 h-2 rounded-full ${streaming ? "bg-emerald-400 animate-ping" : "bg-slate-600"}`} />
              <span className={streaming ? "text-emerald-400 font-semibold" : "text-slate-400"}>
                {streaming ? "STREAM ACTIVE" : "NO ACTIVE STREAM"}
              </span>
            </div>
          </div>

          {/* VIDEO MONITOR FRAME */}
          <section className="border border-slate-800 bg-[#0b0f17] rounded-xl overflow-hidden shadow-2xl">
            <div className="h-9 border-b border-slate-800/80 px-4 flex items-center justify-between text-[10px] text-slate-400 tracking-wider bg-slate-900/30">
              <span>LIVE_MEDIA_MONITOR</span>
              <span>PROTOCOL: WEBRTC</span>
              <span className="hidden sm:inline">ENCRYPTED TRANSPORT</span>
            </div>

            <div className="relative aspect-video max-h-[550px] bg-black/90 flex items-center justify-center overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                controls
                className={`w-full h-full object-contain ${
                  streaming ? "block" : "hidden"
                }`}
              />

              {!streaming && (
                <div className="text-center p-8 space-y-3">
                  <div className="w-14 h-14 border border-slate-800 bg-slate-900/50 rounded-xl grid place-items-center text-slate-400 text-xl mx-auto shadow-inner">
                    ▣
                  </div>
                  <div className="text-xs font-bold text-slate-200 tracking-widest uppercase">
                    NO MEDIA SIGNAL
                  </div>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Waiting for an authorized capture device connection.
                  </p>
                  <div className="text-[10px] text-emerald-400 font-mono pt-2 animate-pulse">
                    &gt; LISTENING_FOR_WEBRTC...
                  </div>
                </div>
              )}

              {streaming && (
                <div className="absolute top-4 left-4 bg-slate-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-md flex items-center gap-2 shadow-lg">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                  LIVE
                </div>
              )}
            </div>

            <div className="h-8 border-t border-slate-800/80 px-4 flex items-center justify-between text-[10px] text-slate-400 bg-slate-900/30">
              <span>SOURCE: CAPTURE CLIENT</span>
              <span className={streaming ? "text-emerald-400 font-medium" : "text-slate-400"}>
                {streaming ? "SIGNAL RECEIVED" : "SIGNAL WAITING"}
              </span>
            </div>
          </section>

          {/* STATUS CARDS GRID */}
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className={`p-3.5 rounded-lg border bg-slate-900/30 flex items-center gap-3 transition-all ${
              videoActive ? "border-emerald-500/40 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.05)]" : "border-slate-800"
            }`}>
              <div className="w-8 h-8 rounded border border-slate-700/60 bg-slate-800/40 grid place-items-center text-[10px] font-bold text-slate-300">
                VID
              </div>
              <div>
                <span className="block text-[9px] text-slate-400">VIDEO TRACK</span>
                <strong className={`text-xs ${videoActive ? "text-emerald-400" : "text-slate-400"}`}>
                  {videoActive ? "ACTIVE" : "WAITING"}
                </strong>
              </div>
            </div>

            <div className={`p-3.5 rounded-lg border bg-slate-900/30 flex items-center gap-3 transition-all ${
              audioActive ? "border-emerald-500/40 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.05)]" : "border-slate-800"
            }`}>
              <div className="w-8 h-8 rounded border border-slate-700/60 bg-slate-800/40 grid place-items-center text-[10px] font-bold text-slate-300">
                AUD
              </div>
              <div>
                <span className="block text-[9px] text-slate-400">AUDIO TRACK</span>
                <strong className={`text-xs ${audioActive ? "text-emerald-400" : "text-slate-400"}`}>
                  {audioActive ? "ACTIVE" : "WAITING"}
                </strong>
              </div>
            </div>

            <div className={`p-3.5 rounded-lg border bg-slate-900/30 flex items-center gap-3 transition-all ${
              connected ? "border-emerald-500/40 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.05)]" : "border-slate-800"
            }`}>
              <div className="w-8 h-8 rounded border border-slate-700/60 bg-slate-800/40 grid place-items-center text-[10px] font-bold text-slate-300">
                WS
              </div>
              <div>
                <span className="block text-[9px] text-slate-400">SIGNALING</span>
                <strong className={`text-xs ${connected ? "text-emerald-400" : "text-slate-400"}`}>
                  {connected ? "CONNECTED" : "OFFLINE"}
                </strong>
              </div>
            </div>

            <div className={`p-3.5 rounded-lg border bg-slate-900/30 flex items-center gap-3 transition-all ${
              webRTCState === "connected" ? "border-emerald-500/40 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.05)]" : "border-slate-800"
            }`}>
              <div className="w-8 h-8 rounded border border-slate-700/60 bg-slate-800/40 grid place-items-center text-[10px] font-bold text-slate-300">
                RTC
              </div>
              <div>
                <span className="block text-[9px] text-slate-400">WEBRTC</span>
                <strong className={`text-xs ${webRTCState === "connected" ? "text-emerald-400" : "text-slate-400"}`}>
                  {webRTCState.toUpperCase()}
                </strong>
              </div>
            </div>
          </section>

          {/* EVENT LOGS */}
          <section className="border border-slate-800 bg-[#0b0f17] rounded-xl overflow-hidden shadow-lg">
            <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/20 flex items-center justify-between">
              <div>
                <span className="block text-xs font-bold text-slate-200 tracking-wider">
                  SYSTEM EVENTS
                </span>
                <span className="text-[9px] text-slate-400 uppercase">
                  REAL-TIME SIGNALING LOG
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                {events.length.toString().padStart(2, "0")} EVENTS
              </span>
            </div>

            <div className="p-4 space-y-2 min-h-[120px] text-xs font-mono">
              {events.length === 0 && (
                <div className="text-slate-500 py-6 text-center text-xs">
                  No events recorded.
                </div>
              )}
              {events.map((event, index) => (
                <div
                  className="grid grid-cols-[80px_20px_1fr] gap-2 items-center border-b border-slate-800/40 pb-1.5 hover:bg-slate-800/20 px-1 rounded transition"
                  key={`${event.time}-${index}`}
                >
                  <span className="text-slate-400 text-[11px]">{event.time}</span>
                  <span className="text-emerald-400 font-bold">&gt;</span>
                  <span className="text-slate-300">{event.message}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ERROR ALERT */}
          {error && (
            <div className="p-3.5 border border-rose-500/30 bg-rose-500/10 text-rose-300 rounded-lg text-xs flex items-center gap-3">
              <span className="font-bold uppercase tracking-wider text-rose-400">[ERROR]</span>
              <span>{error}</span>
            </div>
          )}

        </main>

      </div>

    </div>
  );
}

export default Viewer;