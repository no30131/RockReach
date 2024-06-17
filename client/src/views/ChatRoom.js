import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import "./stylesheets/ChatRoom.css";

const socket = io("http://localhost:7000");

const ChatRoom = ({ userId, friendId }) => {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");

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

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await fetch(`http://localhost:7000/api/friends/chat/${friendId}`);
                if (response.ok) {
                    const data = await response.json();
                    setMessages(data.chat || []);   
                } else {
                    console.error("Failed to fetch messages");
                }
            } catch (error) {
                console.error("Error fetching messages: ", error);
            }
        };

        fetchMessages();
    }, [friendId]);

    const handleSendMessage = () => {
        if (message.trim() !== "") {
            // const newMessage = {
            //     talker: userId,
            //     message,
            //     time: new Date(),
            // };

            socket.emit("sendMessage", { friendId, talker: userId, message });
            // setMessages((prevMessages) => [...prevMessages, newMessage]);
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
                        <span>{new Date(msg.time).toLocaleTimeString()}</span>
                    </div>
                ))}
            </div>
            <div className="chat-input">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown = {(e) => {
                        if (e.key === "Enter") handleSendMessage();
                    }}
                />
                <button onClick={handleSendMessage}>發送</button>
            </div>
        </div>
    );
};

export default ChatRoom;