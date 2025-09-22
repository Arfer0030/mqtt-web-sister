"use client";

import { useState, useEffect } from "react";
import TopicList from "./components/TopicList";
import Chat from "./components/Chat";
import { useMqtt } from "./hooks/useMqtt";

export default function Home() {
  const { isConnected, messages, subscribe, publish } = useMqtt();
  const [selectedTopic, setSelectedTopic] = useState("");
  const [subscribedTopics, setSubscribedTopics] = useState(["sistercoba"]);

  useEffect(() => {
    if (isConnected) {
      subscribe("sistercoba");
    }
  }, [isConnected]);

  const handleTopicSubscribe = (topic) => {
    if (!subscribedTopics.includes(topic)) {
      setSubscribedTopics((prev) => [...prev, topic]);
      subscribe(topic);
    }
  };

  const handleSendMessage = (topic, message) => {
    publish(topic, message);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <TopicList
        onTopicSelect={setSelectedTopic}
        subscribedTopics={subscribedTopics}
        onSubscribe={handleTopicSubscribe}
      />

      <Chat
        topic={selectedTopic}
        messages={messages}
        onSendMessage={handleSendMessage}
        isConnected={isConnected}
      />
    </div>
  );
}
