const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const WebSocket = require('ws');
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

function createGrpcClient() {
  return new chatProto.ChatService('localhost:50051', grpc.credentials.createInsecure());
}

const wss = new WebSocket.Server({ port: 8081 });
console.log('Reverse proxy WebSocket en écoute sur ws://localhost:8080');

wss.on('connection', (ws) => {
  console.log('Nouveau client WebSocket connecté.');
  const grpcClient = createGrpcClient();
  const grpcStream = grpcClient.Chat();

  grpcStream.on('data', (chatStreamMessage) => {
    console.log('Message reçu du serveur gRPC:', chatStreamMessage);
    ws.send(JSON.stringify(chatStreamMessage));
  });

  grpcStream.on('error', (err) => {
    console.error('Erreur dans le stream gRPC:', err);
    ws.send(JSON.stringify({ error: err.message }));
  });

  grpcStream.on('end', () => {
    console.log('Stream gRPC terminé.');
    ws.close();
  });

  ws.on('message', (message) => {
    console.log('Message reçu du client WebSocket:', message);
    try {
      const parsed = JSON.parse(message);
      grpcStream.write(parsed);
    } catch (err) {
      console.error('Erreur lors de la conversion du message JSON:', err);
      ws.send(JSON.stringify({ error: 'Format JSON invalide' }));
    }
  });

  ws.on('close', () => {
    console.log('Client WebSocket déconnecté, fermeture du stream gRPC.');
    grpcStream.end();
  });
});
