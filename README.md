# 🚀 Reverse Proxy WebSocket avec gRPC

Ce projet implémente un **reverse proxy WebSocket** qui sert d'intermédiaire entre des clients WebSocket et un serveur gRPC. Il permet aux utilisateurs de discuter en temps réel via WebSocket tout en stockant et récupérant l'historique des messages via un backend gRPC.

Le projet permet une **communication bidirectionnelle** entre les clients WebSocket et le serveur gRPC, et est conçu pour gérer les **messages de chat** ainsi que l'**historique des discussions**.

---

## 🛠 Prérequis

Avant de commencer, assurez-vous d'avoir installé les outils suivants :

- [Node.js](https://nodejs.org/) (version 14 ou supérieure)
- [gRPC](https://grpc.io/) et les bibliothèques associées
- [Protocol Buffers](https://developers.google.com/protocol-buffers) pour définir les messages gRPC

---

## ⚡ Installation

1. Clonez ce dépôt sur votre machine locale :


   git clone https://github.com/medalimab/grpc-ws-reverse-proxy.git
   cd grpc-ws-reverse-proxy
Installez les dépendances nécessaires avec npm :


npm install
Assurez-vous que vous avez les fichiers .proto nécessaires pour définir les services gRPC. Le fichier chat.proto contient la définition du service de chat, y compris les messages et les méthodes.

📁 Structure du Projet
proxy.js : Implémente le reverse proxy WebSocket, qui reçoit les messages des clients WebSocket et interagit avec le serveur gRPC pour envoyer et recevoir des messages, ainsi que pour récupérer l'historique des messages.

chat.proto : Contient la définition du service gRPC pour gérer le chat, y compris les messages, l'historique et les utilisateurs.

server.js : Implémente le serveur gRPC, qui gère les connexions des clients et interagit avec le reverse proxy.

client.html : Exemple de client WebSocket pour interagir avec le reverse proxy via un navigateur.

🚀 Lancer le projet
1. Démarrer le serveur gRPC
Exécutez le serveur gRPC, qui sera responsable du traitement des messages et de la gestion de l'historique :


node server.js
Le serveur gRPC écoutera par défaut sur localhost:50051.

2. Démarrer le reverse proxy WebSocket
Exécutez le reverse proxy WebSocket, qui écoute les connexions WebSocket des clients et transmet les messages au serveur gRPC :


node proxy.js
Le reverse proxy WebSocket sera accessible à l'adresse ws://localhost:8081.

3. Utiliser l'interface Web
Ouvrez le fichier client.html dans votre navigateur pour tester la communication WebSocket.

4. Envoyer un message
Saisissez un ID de salle et un nom d'utilisateur.

Tapez votre message dans le champ de texte et cliquez sur "Envoyer".

Le message sera envoyé au serveur gRPC et transmis à tous les clients WebSocket connectés.

5. Afficher l'historique des messages
Saisissez un ID de salle dans le champ de texte.

Cliquez sur "Afficher l'historique" pour récupérer tous les messages précédemment envoyés dans cette salle.

📝 Fonctionnalités
Chat en temps réel : Les clients peuvent envoyer et recevoir des messages en temps réel via WebSocket.

Historique des messages : Les messages sont stockés et récupérés via le serveur gRPC, permettant aux clients de voir l'historique des messages d'une salle spécifique.

Communication bidirectionnelle : Le reverse proxy gère la communication entre les clients WebSocket et le serveur gRPC de manière fluide.










