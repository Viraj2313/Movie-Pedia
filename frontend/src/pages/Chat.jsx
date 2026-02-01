import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import * as signalR from "@microsoft/signalr";
import axios from "axios";
import { Send, ArrowLeft } from "lucide-react";
import Loader, { PageLoader } from "../components/Loader";
import { useNavigate } from "react-router-dom";

const Chat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [connection, setConnection] = useState(null);
  const [friendName, setFriendName] = useState("");
  const [loadingFriendName, setLoadingFriendName] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const messagesEndRef = useRef(null);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const senderId = params.get("senderId");
  const receiverId = params.get("receiverId");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getFriendName = async () => {
    try {
      const response = await axios.get(
        `/api/friends/get-friend-name?receiverId=${receiverId}`
      );
      setFriendName(response.data);
      setLoadingFriendName(false);
    } catch (error) {
      console.error("Error fetching friend name:", error);
      setLoadingFriendName(false);
    }
  };

  useEffect(() => {
    if (senderId && receiverId) {
      getFriendName();
    }
  }, [senderId, receiverId]);

  useEffect(() => {
    if (!senderId || !receiverId) return;

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(`/chathub?userId=${senderId}`)
      .configureLogging(signalR.LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    newConnection
      .start()
      .then(() => {
        console.log("Connected to SignalR hub");
        setConnection(newConnection);

        newConnection.on("ReceiveChatHistory", (history) => {
          setMessages(() => {
            const filteredHistory = history
              .map((msg) => ({
                user: msg.senderId,
                message: msg.messageText,
                timestamp: new Date(msg.timestamp),
              }))
              .filter((msg) => msg.message.trim() !== "");

            return filteredHistory.sort((a, b) => a.timestamp - b.timestamp);
          });
        });

        newConnection.on("ReceiveMessage", (senderId, message) => {
          if (!message.trim()) return;

          setMessages((prev) => [
            ...prev,
            {
              user: senderId,
              message: message,
              timestamp: new Date(),
            },
          ]);
        });

        newConnection.on("ReceiveOnlineStatus", (userId, online) => {
          if (parseInt(userId) === parseInt(receiverId)) {
            setIsOnline(online);
          }
        });

        newConnection.on("UserOnlineStatusChanged", (userId, online) => {
          if (parseInt(userId) === parseInt(receiverId)) {
            setIsOnline(online);
          }
        });

        newConnection.invoke("CheckUserOnline", parseInt(receiverId));

        return newConnection
          .invoke("GetChatHistory", parseInt(senderId), parseInt(receiverId))
          .catch((err) => console.error("Error fetching chat history:", err));
      })
      .then(() => {
        setLoadingMessages(false);
      })
      .catch((err) => console.error("Error connecting to SignalR:", err));

    return () => {
      if (newConnection) {
        newConnection
          .stop()
          .catch((err) => console.error("Error disconnecting:", err));
      }
    };
  }, [senderId, receiverId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !senderId || !receiverId || !connection) return;

    try {
      await connection.invoke(
        "SendMessage",
        parseInt(senderId),
        parseInt(receiverId),
        newMessage
      );

      setMessages((prev) => [
        ...prev,
        {
          user: parseInt(senderId),
          message: newMessage,
          timestamp: new Date(),
        },
      ]);

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loadingFriendName || loadingMessages) {
    return <PageLoader message="Connecting to chat..." />;
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-4 shadow-sm"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate("/friends")}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold">
          {friendName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="font-semibold">{friendName}</h2>
          <p className={`text-xs ${isOnline ? "text-green-500" : "text-gray-400"}`}>
            {isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </motion.div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => {
            const isOwn = msg.user == senderId;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm ${isOwn
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-br-md"
                    : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md border border-gray-200 dark:border-gray-700"
                    }`}
                >
                  <p className="text-sm leading-relaxed">{msg.message}</p>
                  <p
                    className={`text-xs mt-1 ${isOwn ? "text-white/70" : "text-gray-400"
                      }`}
                  >
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl border-2 border-transparent focus:border-orange-500 focus:bg-white dark:focus:bg-gray-600 outline-none transition-all"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={sendMessage}
            disabled={!connection || !newMessage.trim()}
            className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default Chat;
