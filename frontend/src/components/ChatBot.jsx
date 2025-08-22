import React, { useState } from "react";
import axios from "axios";
import { Send, MessageSquare } from "lucide-react"; // Changed icon

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 Welcome to KrishiMitra Chatbot!\nI can assist you with registration, login, selling crops, and contacting support.\n\n🙏 नमस्ते! मैं आपकी मदद रजिस्ट्रेशन, लॉगिन, फसल बेचने और सपोर्ट से संपर्क करने में कर सकता हूँ।"
    }
  ]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);

    try {
      const res = await axios.post(`${API_BASE}/api/chatbot/ask`, { message: input });
      const botReply = res.data.reply;
      setMessages([...newMessages, { sender: "bot", text: botReply }]);
    } catch (err) {
      console.error("Chatbot error:", err);
      setMessages([...newMessages, { sender: "bot", text: "⚠️ Error contacting chatbot." }]);
    }

    setInput("");
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Floating button */}
      {!isOpen && (
        <button
          className="bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-transform transform hover:scale-110"
          onClick={() => setIsOpen(true)}
        >
          <MessageSquare size={28} /> {/* Bigger & better icon */}
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div
          className="w-[28rem] h-[32rem] bg-white shadow-2xl rounded-lg border flex flex-col animate-scaleUp"
        >

          {/* Header */}
          <div className="bg-green-600 text-white p-3 flex justify-between items-center rounded-t-lg">
            <span className="font-bold text-lg">🌾 KrishiMitra Assistant</span>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:text-red-300 transition"
            >
              ✖
            </button>
          </div>

          {/* Messages with background */}
          <div
            className="flex-1 overflow-y-auto p-3"
            style={{
              backgroundImage: "url('/team/chat.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 my-1 rounded-lg max-w-[80%] whitespace-pre-line ${
                  msg.sender === "user"
                    ? "bg-green-200 ml-auto text-right"
                    : "bg-gray-100 mr-auto text-left"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-2 flex gap-2 border-t bg-white">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 border rounded px-3 py-2 focus:outline-none"
              placeholder="Ask me about registration, selling, support..."
            />
            <button
              onClick={sendMessage}
              className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Animation styles */}
      <style>
        {`
          @keyframes scaleUp {
            from { opacity: 0; transform: scale(0.8); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-scaleUp {
            animation: scaleUp 0.3s ease-out;
          }
        `}
      </style>
    </div>
  );
}
