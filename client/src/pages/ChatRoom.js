import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import "./stylesheets/ChatRoom.css";
import Loading from "../components/Loading";
import { useNavigate } from "react-router-dom";
import { deleteToken, getUserFromToken } from "../utils/token";

const socket = io("https://node.me2vegan.com");

const ChatRoom = ({ userId, friendId, showMessage }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [friend, setFriend] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `https://node.me2vegan.com/api/friends/chat/${userId}/${friendId}`
        );
        setMessages(response.data || []);
      } catch (error) {
        console.error("Error fetching messages: ", error);
      } finally {
        setIsLoading(false);
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
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();

    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(loadingTimeout);
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
    const token = getUserFromToken();
    if (!token) {
      deleteToken();
      showMessage("登入超時，請重新登入！", "error");
      setTimeout(() => {
        navigate("/signin");
      }, 1000);
      return;
    }

    if (message.trim() !== "") {
      socket.emit("sendMessage", { friendId, talker: userId, message });
      setMessage("");
    }
  };

  return (
    <div>
      {isLoading ? (
        <Loading />
      ) : (
        <div className="chat-room">
          {friend && (
            <div className="friend-details">
              <img src={friend.image} alt={friend.name} />
              <div className="friend-details-area">
                <p>{friend.name}</p>
                <p className="friend-details-introduce">
                  {friend.introduce}
                </p>
              </div>
            </div>
          )}
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${
                  msg.talker === userId ? "own-message" : ""
                }`}
              >
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
      )}
    </div>
  );
};

export default ChatRoom;
