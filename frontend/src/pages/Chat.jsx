import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import * as signalR from "@microsoft/signalr";
import axios from "axios";
import Loader from "../components/Loader";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
const Chat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [connection, setConnection] = useState(null);
  const [friendName, setFriendName] = useState("");
  const [loadingFriendName, setLoadingFriendName] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const senderId = params.get("senderId");
  const receiverId = params.get("receiverId");

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

        // Handle chat history load once, on connection
        newConnection.on("ReceiveChatHistory", (history) => {
          console.log("Received chat history:", history); // Log the received history

          setMessages((prev) => {
            const filteredHistory = history
              .map((msg) => ({
                user: msg.senderId,
                message: msg.messageText,
                timestamp: new Date(msg.timestamp),
              }))
              .filter((msg) => msg.message.trim() !== ""); // Filter empty messages

            // Return the updated messages with no duplicates and sorted by timestamp
            return filteredHistory.sort((a, b) => a.timestamp - b.timestamp);
          });
        });

        // Handle receiving new messages
        newConnection.on("ReceiveMessage", (senderId, message) => {
          if (!message.trim()) return; // Avoid empty messages

          // Add the new message to state
          setMessages((prev) => [
            ...prev,
            {
              user: senderId,
              message: message,
              timestamp: new Date(),
            },
          ]);
        });

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

  return (
    <>
      {loadingFriendName || loadingMessages ? (
        <>
          <p className="text-xl text-gray-700 mt-4">Loading Chat...</p>
          <Loader />
        </>
      ) : (
        <div className="flex flex-col h-[calc(100vh-5rem)]">
          <div className="bg-blue-600 text-white text-center p-4 font-bold text-lg">
            Chat with {friendName}
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-2">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`max-w-xs p-3 rounded-lg text-white shadow-md ${
                  msg.user == senderId
                    ? "bg-blue-500 ml-auto"
                    : "bg-gray-700 mr-auto"
                }`}
              >
                <strong>
                  {msg.user == senderId ? "You" : `${friendName}`}:
                </strong>
                <p>{msg.message}</p>
              </div>
            ))}
          </div>
          <div className="p-4 bg-white flex items-center border-t sticky bottom-0">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendMessage}
              disabled={!connection}
              className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chat;
