import React, { useState, useEffect } from "react";
import axios from "axios";
import Explore from "./Explore";
import ChatRoom from "./ChatRoom";
import "./stylesheets/Friends.css";
import { getUserFromToken } from "../utils/token";

const Friends = ({ showMessage }) => {
  const [friends, setFriends] = useState([]);
  const [isAddFriendVisible, setIsAddFriendVisible] = useState(false);
  const [userId, setUserId] = useState(null);
  const [selectedFriendId, setSelectedFriendId] = useState(null);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [newFriendName, setNewFriendName] = useState("");

  useEffect(() => {
    const user = getUserFromToken();
    if (user) {
      setUserId(user.userId);
    } else {
      console.error("No user found");
    }
  }, []);

  useEffect(() => {
    if (userId) {
      const fetchFriends = async () => {
        try {
          const response = await axios.get(
            `https://node.me2vegan.com/api/friends/${userId}`
          );
          setFriends(response.data);
        } catch (error) {
          console.error("Error fetching friends: ", error);
        }
      };

      fetchFriends();
    }
  }, [userId]);

  const addFriend = async () => {
    try {

      const userResponse = await axios.get(
        `https://node.me2vegan.com/api/users/name/${newFriendName}`
      );

      if (!userResponse.data) {
        // console.error("User not found with name:", newFriendName);
        showMessage("查無此名稱的使用者！", "error");
        return;
      }

      const userData = userResponse.data;

      const receiverId = userData._id;

      if (receiverId === userId) {
        showMessage("無法加自己為好友！", "error");
        return;
      }

      const newFriend = {
        inviterId: userId,
        receiverId: receiverId,
        friendDate: new Date().toISOString().split("T")[0],
      };

      const response = await axios.post(
        `https://node.me2vegan.com/api/friends/create`,
        newFriend
      );

      if (response.status === 200 || response.status === 201) {
        const updatedFriends = await axios.get(
          `https://node.me2vegan.com/api/friends/${userId}`
        );

        setFriends(updatedFriends.data);
        showMessage("成功添加好友！", "success");
      } else {
        console.error("Error adding friend:", response.statusText);
        showMessage("添加好友失敗，請稍後再試！", "error");
      }
    } catch (error) {
      console.error("Error adding friend:", error);
      if (error.response && error.response.data && error.response.data.error) {
        showMessage(error.response.data.error, "error");
      } else {
        showMessage("伺服器異常，請稍後再試！", "error");
      }
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
  };

  const handleConfirmAddFriend = () => {
    addFriend();
    handleToggleAddFriend();
    setNewFriendName("");
  };

  if (selectedFriendId && isChatVisible) {
    return <ChatRoom userId={userId} friendId={selectedFriendId} />;
  }

  if (selectedFriendId) {
    return <Explore userId={selectedFriendId} />;
  }

  return (
    <div>
      {!userId ? (
        <p>請先登入！</p>
      ) : (
        <div className="friend-list-container">
          <div>
            {friends.length === 0 ? (
              <p>Loading ...</p>
            ) : (
              <div>
                {friends.map((friend) => {
                  const friendInfo =
                    friend.inviterId._id === userId
                      ? friend.receiverId
                      : friend.inviterId;
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
                        onClick={() => handleViewExplore(friendInfo._id)}
                      >
                        查看
                      </button>
                      <button
                        className="btn-chat"
                        onClick={() => handleChat(friendInfo._id)}
                      >
                        聊天
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {isAddFriendVisible && (
            <div className="add-friend-overlay">
              <div className="add-friend-container">
                <h3>新增好友</h3>
                <input
                  type="text"
                  placeholder="輸入使用者名稱 ..."
                  value={newFriendName}
                  onChange={(e) => setNewFriendName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleConfirmAddFriend();
                    }
                  }}
                />
                <div className="add-friend-buttons">
                  <button
                    onClick={handleConfirmAddFriend}
                    className="add-friend-button"
                  >
                    確認
                  </button>
                  <button
                    onClick={handleToggleAddFriend}
                    className="cancel-add-friend-button"
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="friend-add-friend">
            <button className="btn-add-friend" onClick={handleToggleAddFriend}>
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Friends;
