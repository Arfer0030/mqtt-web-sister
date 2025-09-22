// hooks/useMqtt.js
import { useState, useEffect, useRef, useCallback } from "react";
import mqtt from "mqtt";

export const useMqtt = () => {
  const clientRef = useRef(null);

  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState({});

  // --- Publish Pesan ---
  const publish = useCallback((topic, message) => {
    if (clientRef.current && clientRef.current.connected) {
      const msgData = {
        id: Date.now(),
        topic,
        message,
        sender: "self",
        timestamp: new Date().toLocaleTimeString(),
      };

      // update state lokal
      setMessages((prev) => ({
        ...prev,
        [topic]: [...(prev[topic] || []), msgData],
      }));

      clientRef.current.publish(
        topic,
        message,
        { qos: 0, retain: false },
        (err) => {
          if (err) console.error("Publish error:", err);
        }
      );
    }
  }, []);

  // --- Subscribe ke topic ---
  const subscribe = useCallback((topic) => {
    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.subscribe(topic, (err) => {
        if (err) {
          console.error(`Failed to subscribe ${topic}`, err);
        } else {
          console.log(`Subscribed to ${topic}`);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (clientRef.current) return; // hindari koneksi ganda

    const brokerUrl = "ws://34.169.63.96:8083"; // ✅ port WebSocket Mosquitto
    const clientId = `mqttjs_${Math.random().toString(16).slice(3)}`;

    const options = {
      clientId,
      clean: true,
      connectTimeout: 30000,
      username: "sister",
      password: "windows10",
      reconnectPeriod: 5000,
      keepalive: 60,
      protocolVersion: 4, // MQTT 3.1.1
      will: {
        topic: "clients/disconnect",
        payload: clientId,
        qos: 0,
        retain: false,
      },
    };

    console.log(`Connecting to MQTT broker at ${brokerUrl}`);
    const client = mqtt.connect(brokerUrl, options);
    clientRef.current = client;

    // --- Event Listeners ---
    client.on("connect", () => {
      console.log("✅ Connected to MQTT broker");
      setIsConnected(true);
    });

    client.on("message", (topic, payload) => {
      const msgData = {
        id: Date.now(),
        topic,
        message: payload.toString(),
        sender: "other",
        timestamp: new Date().toLocaleTimeString(),
      };
      console.log(`📩 [${topic}] ${msgData.message}`);

      setMessages((prev) => ({
        ...prev,
        [topic]: [...(prev[topic] || []), msgData],
      }));
    });

    client.on("error", (err) => {
      console.error("❌ Connection error:", err);
      setIsConnected(false);
      client.end();
    });

    client.on("close", () => {
      console.log("🔌 Connection closed");
      setIsConnected(false);
    });

    client.on("offline", () => {
      console.log("📴 Client offline");
      setIsConnected(false);
    });

    client.on("reconnect", () => {
      console.log("♻️ Reconnecting...");
    });

    return () => {
      if (clientRef.current) {
        console.log("👋 Ending MQTT connection");
        clientRef.current.end();
        clientRef.current = null;
      }
    };
  }, []);

  return { isConnected, messages, subscribe, publish };
};
