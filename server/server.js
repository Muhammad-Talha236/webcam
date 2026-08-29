const WebSocket = require("ws");

const PORT = 8080;

const wss = new WebSocket.Server({
  host: "0.0.0.0",
  port: PORT,
});

let client = null;
let viewer = null;

console.log(`Signaling server running on port ${PORT}`);

function send(socket, data) {
  if (
    socket &&
    socket.readyState === WebSocket.OPEN
  ) {
    socket.send(JSON.stringify(data));
  }
}

wss.on("connection", (socket) => {
  console.log("New WebSocket connection");

  socket.on("message", (message) => {
    let data;

    try {
      data = JSON.parse(message.toString());
    } catch {
      console.log("Invalid signaling message");
      return;
    }

    // ==============================
    // CAPTURE CLIENT
    // ==============================

    if (data.type === "client") {
      client = socket;

      console.log("Capture client registered");

      send(client, {
        type: "registered",
        role: "client",
      });

      if (
        viewer &&
        viewer.readyState === WebSocket.OPEN
      ) {
        console.log("Viewer already connected");

        send(client, {
          type: "viewer-ready",
        });
      }

      return;
    }

    // ==============================
    // VIEWER
    // ==============================

    if (data.type === "viewer") {
      viewer = socket;

      console.log("Viewer registered");

      send(viewer, {
        type: "registered",
        role: "viewer",
      });

      if (
        client &&
        client.readyState === WebSocket.OPEN
      ) {
        console.log(
          "Notifying client: viewer-ready"
        );

        send(client, {
          type: "viewer-ready",
        });
      }

      return;
    }

    // ==============================
    // CAPTURE READY
    // ==============================

    if (data.type === "capture-ready") {
      console.log("Capture media is ready");

      if (
        viewer &&
        viewer.readyState === WebSocket.OPEN
      ) {
        send(client, {
          type: "viewer-ready",
        });
      }

      return;
    }

    // ==============================
    // OFFER
    // ==============================

    if (data.type === "offer") {
      console.log("Forwarding OFFER -> viewer");

      send(viewer, {
        type: "offer",
        offer: data.offer,
      });

      return;
    }

    // ==============================
    // ANSWER
    // ==============================

    if (data.type === "answer") {
      console.log("Forwarding ANSWER -> client");

      send(client, {
        type: "answer",
        answer: data.answer,
      });

      return;
    }

    // ==============================
    // ICE
    // ==============================

    if (data.type === "ice-candidate") {
      if (socket === client) {
        send(viewer, data);
      }

      if (socket === viewer) {
        send(client, data);
      }

      return;
    }
  });

  socket.on("close", () => {
    if (socket === client) {
      console.log("Capture client disconnected");

      client = null;

      send(viewer, {
        type: "client-disconnected",
      });
    }

    if (socket === viewer) {
      console.log("Viewer disconnected");

      viewer = null;

      send(client, {
        type: "viewer-disconnected",
      });
    }
  });

  socket.on("error", (error) => {
    console.error(
      "WebSocket error:",
      error.message
    );
  });
});