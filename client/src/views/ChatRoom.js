import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import "./stylesheets/ChatRoom.css";

const socket = io("https://node.me2vegan.com");

const ChatRoom = ({ userId, friendId }) => {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [friend, setFriend] = useState(null);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get(`https://node.me2vegan.com/api/friends/chat/${userId}/${friendId}`);
                setMessages(response.data || []);
            } catch (error) {
                console.error("Error fetching messages: ", error);
            }
        };

        fetchMessages();

        const fetchUserData = async () => {
            try {
                const userResponse = await axios.get(
                    `https://node.me2vegan.com/api/users/${friendId}`
                );
                setFriend(userResponse.data);
                // console.log("friend: ", userResponse.data);
            } catch (error) {
                console.error("Error fetching freind details: ", error);
            }
        };
        fetchUserData();
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
            {friend ? (
                <div className="friend-details">
                    <img src={friend.image} alt={friend.name} />
                    <p>{friend.name}</p>
                </div>
            ) : (
                <div className="friend-details">
                    <p>&nbsp;&nbsp;Loading ...</p>
                </div>
            )}
            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.talker === userId ? "own-message" : ""}`}>
                        <span>{new Date(msg.time).toLocaleString()}</span>
                        <p className="single-message-box">{msg.message}</p>
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
                    placeholder="write something..."
                />
                <button onClick={handleSendMessage}>發送</button>
            </div>
        </div>
    );
};

export default ChatRoom;
