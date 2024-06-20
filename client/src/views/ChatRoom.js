import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import "./stylesheets/ChatRoom.css";

const socket = io("http://localhost:7000");

const ChatRoom = ({ userId, friendId }) => {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get(`http://localhost:7000/api/friends/chat/${userId}/${friendId}`);
                setMessages(response.data || []);
            } catch (error) {
                console.error("Error fetching messages: ", error);
            }
        };

        fetchMessages();
    }, [userId, friendId]);

    useEffect(() => {
        socket.emit("joinRoom", { friendId });

        socket.on("receiveMessage", (newMessage) => {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        });

        return () => {
            socket.off("receiveMessage");
            socket.emit("leaveRoom", { friendId });
        };
    }, [friendId]);

    const handleSendMessage = () => {
        if (message.trim() !== "") {
            socket.emit("sendMessage", { friendId, talker: userId, message });
            setMessage("");
        }
    };

    return (
        <div className="chat-room">
            <h2>聊天室</h2>
            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.talker === userId ? "own-message" : ""}`}>
                        <p>{msg.message}</p>
                        <span>{new Date(msg.time).toLocaleString()}</span>
                    </div>
                ))}
            </div>
            <div className="chat-input">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleSendMessage();
                    }}
                />
                <button onClick={handleSendMessage}>發送</button>
            </div>
        </div>
    );
};

export default ChatRoom;
