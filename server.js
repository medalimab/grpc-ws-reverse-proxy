const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, 'chat.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const chatProto = grpc.loadPackageDefinition(packageDefinition).chat;

// Utilisateur fictif
const admin = {
  id: "admin",
  name: "dali",
  email: "dali@mail.com",
  status: "ACTIVE",
};

// Exemple d'historique des messages
let messageHistory = [
  { room_id: 'room1', sender_id: 'user1', content: 'Hello!' },
  { room_id: 'room1', sender_id: 'user2', content: 'Hi there!' },
];

// Implémentation de la méthode GetUser
function getUser(call, callback) {
  const userId = call.request.user_id;
  console.log(`Requête GetUser reçue pour id: ${userId}`);
  const user = { ...admin, id: userId };
  callback(null, { user });
}

// Implémentation de la méthode GetChatHistory
function getChatHistory(call, callback) {
  const roomId = call.request.room_id;
  console.log(`Requête GetChatHistory reçue pour room_id: ${roomId}`);
  
  // Filtrer les messages par room_id
  const history = messageHistory
    .filter(msg => msg.room_id === roomId)
    .map(msg => ({
      room_id: msg.room_id,
      sender_id: msg.sender_id,
      content: msg.content,
    }));

  callback(null, { messages: history });
}
// Implémentation du chat (stream)
function chat(call) {
  console.log("Flux Chat démarré.");

  call.on('data', (chatStreamMessage) => {
    if (chatStreamMessage.chat_message) {
      const msg = chatStreamMessage.chat_message;
      console.log(`Message reçu de ${msg.sender_id}: ${msg.content}`);

      // Stocker le message dans l'historique avec une structure correcte
      const newMessage = {
        room_id: msg.room_id,
        sender_id: msg.sender_id,
        content: msg.content,
      };
      messageHistory.push(newMessage);

      // Répondre au client
      const reply = {
        id: msg.id + "_reply",
        room_id: msg.room_id,
        sender_id: admin.id,
        content: msg.content,
      };
      call.write({ chat_message: reply });
    }
  });

  call.on('end', () => {
    console.log("Fin du flux Chat.");
    call.end();
  });
}

// Démarrer le serveur gRPC
function main() {
  const server = new grpc.Server();
  server.addService(chatProto.ChatService.service, {
    GetUser: getUser,
    Chat: chat,
    GetChatHistory: getChatHistory, // Ajouter cette ligne pour implémenter la méthode GetChatHistory
  });

  const address = '0.0.0.0:50051';
  server.bindAsync(address, grpc.ServerCredentials.createInsecure(), (error, port) => {
    if (error) {
      console.error("Erreur lors du binding du serveur :", error);
      return;
    }
    console.log(`Serveur gRPC en écoute sur ${address}`);
  });
}

main();
