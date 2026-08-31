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
    <div className="security-dashboard">

      {/* ==============================
          HEADER
      ============================== */}

      <header className="security-header">

        <div className="security-brand">

          <div className="brand-mark">
            RL
          </div>

          <div>
            <h1>
              SECURE MEDIA LAB
            </h1>

            <p>
              AUTHORIZED WEBRTC TEST ENVIRONMENT
            </p>
          </div>

        </div>

        <div className="header-status">

          <span
            className={
              connected
                ? "system-dot online"
                : "system-dot"
            }
          />

          <span>
            {connected
              ? "SYSTEM ONLINE"
              : "SYSTEM OFFLINE"}
          </span>

        </div>

      </header>

      {/* ==============================
          LAYOUT
      ============================== */}

      <div className="security-layout">

        {/* ============================
            SIDEBAR
        ============================ */}

        <aside className="security-sidebar">

          <div className="side-section-title">
            MONITOR
          </div>

          <div className="side-item selected">
            <span>01</span>
            LIVE FEED
          </div>

          <div className="side-item">
            <span>02</span>
            CONNECTION
          </div>

          <div className="side-item">
            <span>03</span>
            MEDIA STATUS
          </div>

          <div className="side-item">
            <span>04</span>
            EVENT LOG
          </div>

          <div className="sidebar-divider" />

          <div className="side-section-title">
            PROTOCOL
          </div>

          <div className="protocol-row">
            <span>WS</span>
            <b className={connected ? "ok" : ""}>
              {connected
                ? "CONNECTED"
                : "OFFLINE"}
            </b>
          </div>

          <div className="protocol-row">
            <span>RTC</span>
            <b
              className={
                webRTCState ===
                "connected"
                  ? "ok"
                  : ""
              }
            >
              {webRTCState.toUpperCase()}
            </b>
          </div>

          <div className="sidebar-footer">
            LAB BUILD 2026.1
          </div>

        </aside>

        {/* ============================
            MAIN
        ============================ */}

        <main className="security-main">

          <div className="main-heading">

            <div>
              <div className="eyebrow">
                MEDIA MONITOR / 01
              </div>

              <h2>
                Live Capture Feed
              </h2>

              <p>
                Authorized camera and microphone
                WebRTC test stream.
              </p>
            </div>

            <div className="session-state">

              <span
                className={
                  streaming
                    ? "pulse-dot"
                    : ""
                }
              />

              {streaming
                ? "STREAM ACTIVE"
                : "NO ACTIVE STREAM"}

            </div>

          </div>

          {/* ==========================
              VIDEO MONITOR
          ========================== */}

          <section className="monitor">

            <div className="monitor-topbar">

              <span>
                LIVE_MEDIA_MONITOR
              </span>

              <span>
                PROTOCOL: WEBRTC
              </span>

              <span>
                ENCRYPTED TRANSPORT
              </span>

            </div>

            <div className="video-area">

              <video
                ref={videoRef}
                autoPlay
                playsInline
                controls
                className={
                  streaming
                    ? "remote-feed visible"
                    : "remote-feed"
                }
              />

              {!streaming && (
                <div className="no-feed">

                  <div className="no-feed-icon">
                    ▣
                  </div>

                  <div className="no-feed-title">
                    NO MEDIA SIGNAL
                  </div>

                  <div className="no-feed-text">
                    Waiting for an authorized
                    capture device.
                  </div>

                  <div className="terminal-line">
                    &gt; LISTENING_FOR_WEBRTC...
                  </div>

                </div>
              )}

              {streaming && (
                <div className="live-indicator">
                  ● LIVE
                </div>
              )}

            </div>

            <div className="monitor-footer">

              <span>
                SOURCE: CAPTURE CLIENT
              </span>

              <span>
                {streaming
                  ? "SIGNAL RECEIVED"
                  : "SIGNAL WAITING"}
              </span>

            </div>

          </section>

          {/* ==========================
              STATUS GRID
          ========================== */}

          <section className="status-grid">

            <div className={statusClass(videoActive)}>

              <div className="status-icon">
                VID
              </div>

              <div>
                <span>
                  VIDEO TRACK
                </span>

                <strong>
                  {videoActive
                    ? "ACTIVE"
                    : "WAITING"}
                </strong>
              </div>

            </div>

            <div className={statusClass(audioActive)}>

              <div className="status-icon">
                AUD
              </div>

              <div>
                <span>
                  AUDIO TRACK
                </span>

                <strong>
                  {audioActive
                    ? "ACTIVE"
                    : "WAITING"}
                </strong>
              </div>

            </div>

            <div
              className={statusClass(
                connected
              )}
            >

              <div className="status-icon">
                WS
              </div>

              <div>
                <span>
                  SIGNALING
                </span>

                <strong>
                  {connected
                    ? "CONNECTED"
                    : "OFFLINE"}
                </strong>
              </div>

            </div>

            <div
              className={statusClass(
                webRTCState ===
                "connected"
              )}
            >

              <div className="status-icon">
                RTC
              </div>

              <div>
                <span>
                  WEBRTC
                </span>

                <strong>
                  {webRTCState.toUpperCase()}
                </strong>
              </div>

            </div>

          </section>

          {/* ==========================
              EVENT LOG
          ========================== */}

          <section className="event-panel">

            <div className="panel-heading">

              <div>
                <span>
                  SYSTEM EVENTS
                </span>

                <small>
                  REAL-TIME SIGNALING LOG
                </small>
              </div>

              <span className="event-count">
                {events.length
                  .toString()
                  .padStart(2, "0")} EVENTS
              </span>

            </div>

            <div className="event-list">

              {events.length === 0 && (
                <div className="empty-event">
                  No events recorded.
                </div>
              )}

              {events.map(
                (event, index) => (
                  <div
                    className="event-row"
                    key={`${event.time}-${index}`}
                  >
                    <span>
                      {event.time}
                    </span>

                    <b>
                      {">"}
                    </b>

                    <p>
                      {event.message}
                    </p>
                  </div>
                )
              )}

            </div>

          </section>

          {error && (
            <div className="security-error">
              <strong>
                CONNECTION ERROR
              </strong>

              <span>
                {error}
              </span>
            </div>
          )}

        </main>

      </div>

    </div>
  );
}

export default Viewer;