import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import Navbar from "../Components/Navbar.jsx";
import toast from "react-hot-toast";
import "../Styles/Chat.css";

const Chat = () => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [userName, setUserName] = useState("Anonymous Student");
  
  const chatBodyRef = useRef(null);
  // ✨ FIX 1: Use a useRef to keep a stable, single instance of the socket connection
  const socketRef = useRef(null);

  // Grab user name on initial load
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUserName(JSON.parse(userData).name);
    }
  }, []);

  // ✨ FIX 2: Manage socket lifecycle cleanly inside a unified useEffect
  useEffect(() => {
    // Initialize connection ONLY once
   socketRef.current = io(import.meta.env.VITE_BACKEND_BASE_URL);//this url is for safety purpose
    //if u r running in browser then write this `http://localhost:4000` in place of `import.meta.env.VITE_BACKEND_BASE_URL`

    // Listeners securely attached to the active socket instance
    socketRef.current.on("chatHistory", (history) => {
      setMessages(history);
    });

    socketRef.current.on("receiveMessage", (newMessage) => {
      // Functional state update ensures we always append to the latest state
      setMessages((prev) => [...prev, newMessage]);
    });

    socketRef.current.on("systemMessage", (sysMsg) => {
      toast.success(sysMsg, { position: "top-center" });
    });

    // CLEANUP: Disconnect and turn off listeners when user leaves the chat page
    return () => {
      if (socketRef.current) {
        socketRef.current.off("chatHistory");
        socketRef.current.off("receiveMessage");
        socketRef.current.off("systemMessage");
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Auto-scroll to bottom whenever a new message arrives
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  // Send message to backend
  const sendMessage = () => {
    if (currentMessage.trim() !== "" && socketRef.current) {
      const messageData = {
        id: Math.random().toString(36).substring(7),
        author: userName,
        message: currentMessage,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      // Use the ref instance to emit the message instantly
      socketRef.current.emit("sendMessage", messageData);
      setCurrentMessage(""); // Clear input box
    }
  };

  return (
    <div>
      <Navbar />
      <div className="chat-container">
        <div className="chat-window">
          
          <div className="chat-header">
            <h2>Live Chat Room</h2>
            <p>Messages clear after 15 chats</p>
          </div>

          <div className="chat-body" ref={chatBodyRef}>
            {messages.length === 0 ? (
              <p className="empty-chat">No messages yet. Start the conversation!</p>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`message ${msg.author === userName ? "you" : "other"}`}
                >
                  <div className="message-content">
                    <p>{msg.message}</p>
                  </div>
                  <div className="message-meta">
                    <p>{msg.author === userName ? "You" : msg.author} • {msg.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="chat-footer">
            <input
              type="text"
              value={currentMessage}
              placeholder="Ask a question or discuss..."
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
            />
            <button onClick={sendMessage}>Send</button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Chat;