const WebSocket = require("ws");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const PROTO_PATH = path.join(__dirname, "chat.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const chatProto = grpc.loadPackageDefinition(packageDefinition).chat;

// Connexion au serveur gRPC
const client = new chatProto.ChatService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

// Création du serveur WebSocket
const wss = new WebSocket.Server({ port: 8081 });
console.log("Reverse proxy WebSocket en écoute sur ws://localhost:8081");

// Crée un stream persistant avec le serveur gRPC
const chatStream = client.Chat();

// Quand le serveur gRPC envoie un message via le stream
chatStream.on("data", (data) => {
  if (data.chat_message) {
    // Réenvoi à tous les clients WebSocket connectés
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({ type: "chat", message: data.chat_message })
        );
      }
    });
  }
});

chatStream.on("error", (err) => {
  console.error("Erreur du stream gRPC:", err);
});

chatStream.on("end", () => {
  console.log("Stream gRPC terminé");
});

wss.on("connection", (socket) => {
  console.log("Client WebSocket connecté");

  socket.on("message", (data) => {
    try {
      const msg = JSON.parse(data);

      if (msg.type === "chat" && msg.chat_message) {
        // Envoi du message dans le stream gRPC
        chatStream.write({ chat_message: msg.chat_message });

      } else if (msg.type === "history" && msg.room_id) {
        // Requête historique via appel unary
        client.GetChatHistory({ room_id: msg.room_id }, (err, response) => {
          if (err) {
            console.error("Erreur gRPC (history):", err);
            return;
          }

          socket.send(
            JSON.stringify({
              type: "history",
              messages: response.messages,
            })
          );
        });
      }

    } catch (err) {
      console.error("Erreur de parsing ou traitement:", err);
    }
  });
});
