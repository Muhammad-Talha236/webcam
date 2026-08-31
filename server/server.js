const WebSocket = require("ws");

// Dynamic port provided by cloud host (Render, Railway, etc.)
const PORT = process.env.PORT || 8080;

const wss = new WebSocket.Server({
  host: "0.0.0.0", // Required for container binding
  port: PORT,
});
let client = null;
let viewer = null;

console.log(`Signaling server running on port ${PORT}[cite: 2]`);

function send(socket, data) {
  if (
    socket &&
    socket.readyState === WebSocket.OPEN
  ) {
    socket.send(JSON.stringify(data));
  }
}

wss.on("connection", (socket) => {
  console.log("New WebSocket connection[cite: 2]");

  socket.on("message", (message) => {
    let data;

    try {
      data = JSON.parse(message.toString());
    } catch {
      console.log("Invalid signaling message[cite: 2]");
      return;
    }

    if (data.type === "client") {
      client = socket;

      console.log("Capture client registered[cite: 2]");

      send(client, {
        type: "registered",
        role: "client",
      });

      if (
        viewer &&
        viewer.readyState === WebSocket.OPEN
      ) {
        console.log("Viewer already connected[cite: 2]");

        send(client, {
          type: "viewer-ready",
        });
      }

      return;
    }

    if (data.type === "viewer") {
      viewer = socket;

      console.log("Viewer registered[cite: 2]");

      send(viewer, {
        type: "registered",
        role: "viewer",
      });

      if (
        client &&
        client.readyState === WebSocket.OPEN
      ) {
        console.log("Notifying client: viewer-ready[cite: 2]");

        send(client, {
          type: "viewer-ready",
        });
      }

      return;
    }

    if (data.type === "capture-ready") {
      console.log("Capture media is ready[cite: 2]");

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

    if (data.type === "offer") {
      console.log("Forwarding OFFER -> viewer[cite: 2]");

      send(viewer, {
        type: "offer",
        offer: data.offer,
      });

      return;
    }

    if (data.type === "answer") {
      console.log("Forwarding ANSWER -> client[cite: 2]");

      send(client, {
        type: "answer",
        answer: data.answer,
      });

      return;
    }

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
      console.log("Capture client disconnected[cite: 2]");

      client = null;

      send(viewer, {
        type: "client-disconnected",
      });
    }

    if (socket === viewer) {
      console.log("Viewer disconnected[cite: 2]");

      viewer = null;

      send(client, {
        type: "viewer-disconnected",
      });
    }
  });

  socket.on("error", (error) => {
    console.error("WebSocket error:");
  });
});