import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./stylesheets/Explore.css";

const apiUrl = process.env.REACT_APP_API_URL;
const frontendUrl = process.env.REACT_APP_FRONTEND_URL;

const Explore = ({ userId }) => {
  const { id } = useParams();
  const [records, setRecords] = useState([]);
  const [currentSlides, setCurrentSlides] = useState({});
  const [newComment, setNewComment] = useState({});
  const [showComments, setShowComments] = useState({});

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const endpoint = id
          ? `${apiUrl}/api/climbrecords/exploreWall/share/${id}`
          : userId
          ? `${apiUrl}/api/climbrecords/exploreWall/${userId}`
          : `${apiUrl}/api/climbrecords/exploreWall/`;
        const response = await axios.get(endpoint);
        setRecords(id ? [response.data] : response.data);
      } catch (error) {
        console.error("Error fetching records: ", error);
      }
    };

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
    const filePath = `${apiUrl}/${file}`;

    const fileStyle = {
      maxWidth: "320px",
      maxHeight: "240px",
      objectFit: "contain",
    };

    if (fileType && fileType.startsWith("video")) {
      return <video key={file} src={filePath} controls style={fileStyle} />;
    } else if (fileType && fileType.startsWith("image")) {
      return <img key={file} src={filePath} alt="file" style={fileStyle} />;
    } else {
      return <p key={file}>Unsupported file type</p>;
    }
  };

  const handleDotClick = (recordId, index) => {
    setCurrentSlides((prev) => ({
      ...prev,
      [recordId]: index
    }));
  };

  const getEndpoint = () => {
    return userId
      ? `${apiUrl}/api/climbrecords/exploreWall/${userId}`
      : `${apiUrl}/api/climbrecords/exploreWall`;
  };

  const handleAddLike = async (recordId, subRecordId) => {
    try {
      await axios.post(`${apiUrl}/api/climbrecords/addLike/${subRecordId}`);
      const endpoint = id
        ? `${apiUrl}/api/climbrecords/exploreWall/share/${id}`
        : getEndpoint();
      const response = await axios.get(endpoint);
      setRecords(id ? [response.data] : response.data);
    } catch (error) {
      console.error("Error adding like: ", error);
    }
  };

  const handleAddComment = async (recordId, subRecordId) => {
    const comment = newComment[subRecordId];
    if (!comment) return;

    try {
      await axios.post(`${apiUrl}/api/climbrecords/addComment/${subRecordId}`, {
        comment
      });
      const endpoint = id
      ? `${apiUrl}/api/climbrecords/exploreWall/share/${id}`
      : getEndpoint();
      const response = await axios.get(endpoint);
      setRecords(id ? [response.data] : response.data);
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
    const shareLink = `${frontendUrl}/explore/${recordId}`;
    prompt("Share this link:", shareLink);
  };

  return (
    <div>
      <h1>動態牆</h1>
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
                  <p className="user-name">User: {record.user?.name || "Unknown User"}</p>
                  <p className="gym-name">岩館: {record.gymName}</p>
                </div>
              </div>
              <div className="record-content">
                <div className="image-slider">
                  {record.records.map((rec, recIndex) =>
                    rec.files.map((file, fileIndex) => (
                      <div
                        className={`slide ${currentSlideIndex === fileIndex ? "active" : ""}`}
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
                          className={`dot ${currentSlideIndex === fileIndex ? "active" : ""}`}
                          key={`${recIndex}-${fileIndex}`}
                          onClick={() => handleDotClick(record._id, fileIndex)}
                        ></span>
                      ))
                    )}
                  </div>
                </div>
                <p className="record-level">等級: {record.records.map(r => r.level).join(', ')}</p>
                <p className="record-memo">Memo: {record.records.map(r => r.memo).join(', ')}</p>
              </div>
              {record.records.map((rec) => (
                <div key={rec._id} className="record-footer">
                  <div className="likes">
                    <button onClick={() => handleAddLike(record._id, rec._id)}>👍</button> {rec.likes}
                  </div>
                  <div className="comments">
                    <button onClick={() => toggleComments(rec._id)}>
                      💬 {rec.comments.length}
                    </button>
                    {showComments[rec._id] && (
                      <>
                      {rec.comments.map((comment, index) => (
                        <p key={index}>{comment}</p>
                      ))}
                      <div className="comment-input">
                        <input
                          type="text"
                          value={newComment[rec._id] || ""}
                          onChange={(e) => handleCommentChange(rec._id, e.target.value)}
                        />
                        <button onClick={() => handleAddComment(record._id, rec._id)}>送出</button>
                      </div>
                      </>
                    )} 
                  </div>
                  <button onClick={() => handleShare(record._id)} className="share-button">
                    ➤
                  </button>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Explore;
