const express = require("express");
const http = require("http");
const path = require("path");
const WebSocket = require("ws");
const mqtt = require("mqtt");

// Konfigurasi Mqtt
const WEB_PORT = 3000;
const MQTT_BROKER_URL = "mqtt://34.187.203.101:1883";
const MQTT_OPTIONS = {
  username: "sister",
  password: "windows10",
  clientId: "bridge_" + Math.random().toString(16).substr(2, 8),
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
};

console.log("Starting MQTT Client Server...");
console.log(`-> MQTT Broker: ${MQTT_BROKER_URL}`);
console.log(`-> Web Server: http://localhost:${WEB_PORT}`);

// Inisialisasi Server Web & WebSocket
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, "public")));

// Koneksi ke Broker MQTT
console.log("Connecting to MQTT Broker...");
const mqttClient = mqtt.connect(MQTT_BROKER_URL, MQTT_OPTIONS);

mqttClient.on("connect", () => {
  console.log("-> MQTT Connected");
});

mqttClient.on("error", (err) => {
  console.error("-> MQTT Error:", err.message);
});

// Simpan topic subscriptions
const subscribedTopics = new Map();
let clientCounter = 0;

// WebSocket Handler
wss.on("connection", (ws) => {
  const clientId = ++clientCounter;
  ws.clientId = clientId;
  console.log(`Client #${clientId} connected`);

  // Handle pesan dari web client
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      console.log(`Client #${clientId}: ${data.action} -> ${data.topic}`);

      if (data.action === "publish") {
        mqttClient.publish(data.topic, data.message, (err) => {
          if (err) {
            console.error(`Publish failed: ${err.message}`);
          } else {
            console.log(`Published: [${data.topic}] = "${data.message}"`);
          }
        });
      } else if (data.action === "subscribe") {
        mqttClient.subscribe(data.topic, (err) => {
          if (err) {
            console.error(`Subscribe failed: ${err.message}`);
          } else {
            console.log(`Subscribed: ${data.topic}`);

            // Simpan subscriber
            if (!subscribedTopics.has(data.topic)) {
              subscribedTopics.set(data.topic, new Set());
            }
            subscribedTopics.get(data.topic).add(ws);
          }
        });
      }
    } catch (e) {
      console.error(`Invalid JSON from Client #${clientId}`);
    }
  });

  ws.on("close", () => {
    console.log(`Client #${clientId} disconnected`);
    // Hapus dari subscriptions
    subscribedTopics.forEach((clients) => {
      clients.delete(ws);
    });
  });

  // Send welcome message
  ws.send(
    JSON.stringify({
      type: "welcome",
      message: `Connected as Client #${clientId}`,
      timestamp: new Date().toISOString(),
    })
  );
});

// Forward MQTT messages ke WebSocket clients
mqttClient.on("message", (topic, message) => {
  console.log(`MQTT: [${topic}] = "${message.toString()}"`);

  const payload = {
    topic: topic,
    message: message.toString(),
    timestamp: new Date().toISOString(),
  };

  // Send ke subscribers
  if (subscribedTopics.has(topic)) {
    const subscribers = subscribedTopics.get(topic);
    subscribers.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(payload));
      }
    });
    console.log(`Forwarded to ${subscribers.size} clients`);
  }
});

// Start server
server.listen(WEB_PORT, () => {
  console.log(`Server running on http://localhost:${WEB_PORT}`);
});

// Shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down...");
  mqttClient.end();
  server.close();
  process.exit(0);
});
