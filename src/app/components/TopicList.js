import { useState } from "react";

const TopicList = ({ onTopicSelect, subscribedTopics, onSubscribe }) => {
  const [newTopic, setNewTopic] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");

  const handleSubscribe = () => {
    if (newTopic.trim()) {
      onSubscribe(newTopic);
      setNewTopic("");
    }
  };

  const handleTopicClick = (topic) => {
    setSelectedTopic(topic);
    onTopicSelect(topic);
  };

  return (
    <div className="w-80 bg-slate-800 text-white p-6 h-screen overflow-y-auto">
      <h3 className="text-xl font-bold mb-6 text-slate-100">Topics</h3>

      <div className="mb-6">
        <input
          type="text"
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
          placeholder="Enter topic name"
          className="w-full px-4 py-2 mb-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          onKeyPress={(e) => e.key === "Enter" && handleSubscribe()}
        />
        <button
          onClick={handleSubscribe}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Subscribe
        </button>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-slate-300 mb-3">
          Subscribed Topics
        </h4>
        {subscribedTopics.map((topic) => (
          <div
            key={topic}
            onClick={() => handleTopicClick(topic)}
            className={`px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
              selectedTopic === topic
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-slate-700 hover:bg-slate-600 text-slate-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{topic}</span>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopicList;
