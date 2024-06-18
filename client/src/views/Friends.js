import React, { useState, useEffect } from "react";
import Explore from "./Explore";
import ChatRoom from "./ChatRoom";
import "./stylesheets/Friends.css";
import { jwtDecode } from "jwt-decode";

const getCookie = (name) => {
  const cookieArr = document.cookie.split("; ");
  for (let i = 0; i < cookieArr.length; i++) {
    const cookiePair = cookieArr[i].split("=");
    if (name === cookiePair[0]) {
      return decodeURIComponent(cookiePair[1]);
    }
  }
  return null;
};

const Friends = () => {
  const [friends, setFriends] = useState([]);
  const [isAddFriendVisible, setIsAddFriendVisible] = useState(false);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [selectedFriendId, setSelectedFriendId] = useState(null);
  const [isChatVisible, setIsChatVisible] = useState(false);

  useEffect(() => {
    const token = getCookie("token");

    if (token) {
      setToken(token);
      const decoded = jwtDecode(token);
      setUserId(decoded.userId);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      const fetchFriends = async () => {
        try {
          const response = await fetch(
            `http://localhost:7000/api/friends/${userId}`
          );
          const data = await response.json();
          setFriends(data);
        } catch (error) {
          console.error("Error fetching friends: ", error);
        }
      };

      fetchFriends();
    }
  }, [userId]);

  const addFriend = async (name) => {
    try {
      const userResponse = await fetch(
        `http://localhost:7000/api/users/name/${name}`
      );
      if (!userResponse.ok) {
        throw new Error("User not found");
      }
      const userData = await userResponse.json();
      const receiverId = userData._id;

      const newFriend = {
        inviterId: userId,
        receiverId: receiverId,
        friendDate: new Date().toISOString().split("T")[0]
      };
      console.log("newFriend: ", newFriend);
      const response = await fetch("http://localhost:7000/api/friends/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newFriend),
      });

      if (response.ok) {
        const addedFriend = await response.json();
        setFriends([...friends, addedFriend]);
      } else {
        console.error("Error adding friend:", response.statusText);
      }
    } catch (error) {
      console.error("Error adding friends:", error);
    }
  };

  const handleToggleAddFriend = () => {
    setIsAddFriendVisible(!isAddFriendVisible);
  };

  const handleViewExplore = (friendId) => {
    setSelectedFriendId(friendId);
  };

  const handleChat = (friendId) => {
    setSelectedFriendId(friendId);
    setIsChatVisible(true);
  }

  if (!token) {
    return <div>請先登入！</div>;
  }

  if (selectedFriendId && isChatVisible) {
    return <ChatRoom userId={userId} friendId={selectedFriendId} />;
  }

  if (selectedFriendId) {
    return <Explore userId={selectedFriendId} />;
  }

  return (
    <div>
      <h1>好友</h1>
      <div className="friend-list-container">
        {friends.map((friend) => {
          const friendInfo = friend.inviterId._id === userId ? friend.receiverId : friend.inviterId;
          return (
            <div className="friend-item" key={friend._id}>
              <img
                src={friendInfo.image}
                alt={friendInfo.name}
                className="friend-image"
              />
              <span className="friend-name">{friendInfo.name}</span>
              <button 
                className="btn-view" 
                onClick={() => handleViewExplore(friendInfo._id)}>
                  查看
                </button>
              <button 
                className="btn-chat"
                onClick={() => handleChat(friendInfo._id)}>
                  聊天  
              </button>
            </div>
          );
        })}
        <button className="btn-add-friend" onClick={handleToggleAddFriend}>
          +
        </button>
        {isAddFriendVisible && (
          <div className="add-friend-overlay">
            <div className="add-friend-container">
              <h2>新增好友</h2>
              <input
                type="text"
                placeholder="輸入使用者名稱 ..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addFriend(e.target.value);
                    handleToggleAddFriend();
                    e.target.value = "";
                  }
                }}
              />
              <button onClick={handleToggleAddFriend}>取消</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Friends;
