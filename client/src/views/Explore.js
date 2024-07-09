import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { getUserFromToken } from "../utils/token";
import { Link } from "react-router-dom";
import "./stylesheets/Explore.css";

const Explore = ({ userId }) => {
  const { id } = useParams();
  const [records, setRecords] = useState([]);
  const [currentSlides, setCurrentSlides] = useState({});
  const [newComment, setNewComment] = useState({});
  const [showComments, setShowComments] = useState({});
  // const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = getUserFromToken();
      if (!user) return;
      const userId = user.userId;

      try {
        const userResponse = await axios.get(
          `https://node.me2vegan.com/api/users/${userId}`
        );
        setUserName(userResponse.data.name);
        // console.log("userName: ", userResponse.data.name);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const endpoint = id
          ? `https://node.me2vegan.com/api/climbrecords/exploreWall/share/${id}`
          : userId
          ? `https://node.me2vegan.com/api/climbrecords/exploreWall/${userId}`
          : `https://node.me2vegan.com/api/climbrecords/exploreWall/`;
        const response = await axios.get(endpoint);
        setRecords(id ? [response.data] : response.data);
      } catch (error) {
        console.error("Error fetching records: ", error);
      }
    };
    // console.log("userId: ", userId);
    fetchRecords();
  }, [id, userId]);

  const renderFile = (file) => {
    const fileTypeMap = {
      mp4: "video/mp4",
      mpeg: "video/mpeg",
      avi: "video/x-msvideo",
      mov: "video/quicktime",
      wmv: "video/x-ms-wmv",
      flv: "video/x-flv",
      mkv: "video/x-matroska",
      "3gp": "video/3gpp",
      "3g2": "video/3gpp2",
      hevc: "video/HEVC",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
    };

    const fileExtension = file.split(".").pop().toLowerCase();
    const fileType = fileTypeMap[fileExtension];
    const filePath = file;

    // const fileStyle = {
    //   maxWidth: "320px",
    //   maxHeight: "240px",
    //   objectFit: "contain",
    // };

    if (fileType && fileType.startsWith("video")) {
      return (
        <div key={file} className="file-container">
          <video src={filePath} controls className="file-content" />
        </div>
      );
    } else if (fileType && fileType.startsWith("image")) {
      return (
        <div key={file} className="file-container">
          <img src={filePath} alt="file" className="file-content" />
        </div>
      );
    } else {
      return <p key={file}>Unsupported file type</p>;
    }
  };

  const handleDotClick = (recordId, index) => {
    setCurrentSlides((prev) => ({
      ...prev,
      [recordId]: index,
    }));
  };

  // const getEndpoint = () => {
  //   return userId
  //     ? `https://node.me2vegan.com/api/climbrecords/exploreWall/${userId}`
  //     : `https://node.me2vegan.com/api/climbrecords/exploreWall`;
  // };

  const handleAddLike = async (recordId, subRecordId) => {
    try {
      await axios.post(
        `https://node.me2vegan.com/api/climbrecords/addLike/${subRecordId}`
      );
      // const endpoint = id
      //   ? `https://node.me2vegan.com/api/climbrecords/exploreWall/share/${id}`
      //   : // : getEndpoint();
      //     `https://node.me2vegan.com/api/climbrecords/exploreWall/share`;
      // const response = await axios.get(endpoint);
      // setRecords(id ? [response.data] : response.data);
      setRecords((prevRecords) =>
        prevRecords.map((record) => {
          if (record._id === recordId) {
            return {
              ...record,
              records: record.records.map((rec) => {
                if (rec._id === subRecordId) {
                  return { ...rec, likes: rec.likes + 1 };
                }
                return rec;
              }),
            };
          }
          return record;
        })
      );
    } catch (error) {
      console.error("Error adding like: ", error);
    }
  };

  const handleAddComment = async (recordId, subRecordId) => {
    const comment = newComment[subRecordId];
    if (!comment || !userName) return console.log("Please login!");

    try {
      const fullComment = `${userName}: ${comment}`;
      await axios.post(
        `https://node.me2vegan.com/api/climbrecords/addComment/${subRecordId}`,
        {
          comment: fullComment,
        }
      );
      // const endpoint = id
      //   ? `https://node.me2vegan.com/api/climbrecords/exploreWall/share/${id}`
      //   : // : getEndpoint();
      //     `https://node.me2vegan.com/api/climbrecords/exploreWall/share`;
      // const response = await axios.get(endpoint);
      // setRecords(id ? [response.data] : response.data);

      setRecords((prevRecords) =>
        prevRecords.map((record) => {
          if (record._id === recordId) {
            return {
              ...record,
              records: record.records.map((rec) => {
                if (rec._id === subRecordId) {
                  return {
                    ...rec,
                    comments: [...rec.comments, fullComment],
                  };
                }
                return rec;
              }),
            };
          }
          return record;
        })
      );
      setNewComment((prev) => ({ ...prev, [subRecordId]: "" }));
      setShowComments((prev) => ({ ...prev, [subRecordId]: true }));
    } catch (error) {
      console.error("Error adding comment: ", error);
    }
  };

  const handleCommentChange = (subRecordId, value) => {
    setNewComment((prev) => ({ ...prev, [subRecordId]: value }));
  };

  const toggleComments = (subRecordId) => {
    setShowComments((prev) => ({ ...prev, [subRecordId]: !prev[subRecordId] }));
  };

  const handleShare = (recordId) => {
    const shareLink = `https://rockreach.me2vegan.com/explore/${recordId}`;
    prompt("Share this link:", shareLink);
  };

  return (
    <div>
      {records.length === 0 ? (
        <p>--- 尚無紀錄 ---</p>
      ) : (
        <div className="explore-container">
          {records.map((record) => {
            const currentSlideIndex = currentSlides[record._id] || 0;
            return (
              <div className="record-card" key={record._id}>
                <div className="record-header">
                  {record.user && (
                    <img
                      src={record.user.image || ""}
                      alt={record.user.name || "User"}
                      className="user-image"
                    />
                  )}
                  <div className="user-info">
                    <p className="explore-user-name">
                      {record.user?.name || "Unknown User"}
                    </p>
                    <p className="gym-name">{record.gymName}</p>
                  </div>
                  <div className="space"></div>
                  {record.records.some((r) => r.wall) && (
                    <div className="record-header-wall">
                      <p>
                        牆面:{" "}
                        {record.records
                          .filter((r) => r.wall)
                          .map((r) => r.wall)
                          .join(", ")}
                      </p>
                    </div>
                  )}
                </div>
                <div className="record-content">
                  <div className="image-slider">
                    {record.records.map((rec, recIndex) =>
                      rec.files.map((file, fileIndex) => (
                        <div
                          className={`slide ${
                            currentSlideIndex === fileIndex ? "active" : ""
                          }`}
                          key={`${recIndex}-${fileIndex}`}
                        >
                          {renderFile(file)}
                        </div>
                      ))
                    )}
                    <div className="pagination">
                      {record.records.map((rec, recIndex) =>
                        rec.files.map((_, fileIndex) => (
                          <span
                            className={`dot ${
                              currentSlideIndex === fileIndex ? "active" : ""
                            }`}
                            key={`${recIndex}-${fileIndex}`}
                            onClick={() =>
                              handleDotClick(record._id, fileIndex)
                            }
                          ></span>
                        ))
                      )}
                    </div>
                  </div>
                  <p className="record-level">
                    等級: {record.records.map((r) => r.level).join(", ")}
                  </p>
                  {record.records.some((r) => r.memo) && (
                    <p className="record-memo">
                      Memo: {record.records.map((r) => r.memo).join(", ")}
                    </p>
                  )}
                </div>
                {record.records.map((rec) => (
                  <div key={rec._id} className="record-footer">
                    <div className="record-footer1">
                      <div className="likes">
                        <button
                          onClick={() => handleAddLike(record._id, rec._id)}
                        >
                          👍 {rec.likes}
                        </button>
                      </div>
                      <div className="comments">
                        <button onClick={() => toggleComments(rec._id)}>
                          💬 {rec.comments.length}
                        </button>
                      </div>
                      <div>
                        <button
                          onClick={() => handleShare(record._id)}
                          className="share-button"
                        >
                          ➤
                        </button>
                      </div>
                    </div>
                    <div className="record-footer2">
                      {showComments[rec._id] && (
                        <>
                          <div className="comment-list">
                            {rec.comments.map((comment, index) => (
                              <p key={index}>{comment}</p>
                            ))}
                          </div>
                          <div className="comment-input">
                            <input
                              type="text"
                              value={newComment[rec._id] || ""}
                              onChange={(e) =>
                                handleCommentChange(rec._id, e.target.value)
                              }
                              placeholder="write something..."
                            />
                            <button
                              onClick={() =>
                                handleAddComment(record._id, rec._id)
                              }
                            >
                              送出
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
      <Link to="/upload" className="btn-explore-add-record">
        +
      </Link>
    </div>
  );
};

export default Explore;
