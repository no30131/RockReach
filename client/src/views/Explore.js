import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { getUserFromToken } from "../utils/token";
import "./stylesheets/Explore.css";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import { FaFilter, FaShare } from "react-icons/fa";

const Explore = ({ userId, showMessage }) => {
  const { id } = useParams();
  const [records, setRecords] = useState([]);
  const [currentSlides, setCurrentSlides] = useState({});
  const [newComment, setNewComment] = useState({});
  const [showComments, setShowComments] = useState({});
  const [commentButtonDisabled, setCommentButtonDisabled] = useState({});
  const [userName, setUserName] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterGym, setFilterGym] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [gymOptions, setGymOptions] = useState([]);
  const [isRecommended, setIsRecommended] = useState(false);
  const navigate = useNavigate();

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
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const fetchUserRecords = async (userId) => {
    try {
      const response = await axios.get(
        `https://node.me2vegan.com/api/climbRecords/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching user records:", error);
      return [];
    }
  };

  const fetchGymOptions = async () => {
    try {
      const response = await axios.get(
        `https://node.me2vegan.com/api/gyms/all`
      );
      setGymOptions(response.data);
    } catch (error) {
      console.error("Error fetching gym options:", error);
    }
  };

  useEffect(() => {
    fetchGymOptions();
  }, []);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        let endpoint;
        if (id) {
          endpoint = `https://node.me2vegan.com/api/climbrecords/exploreWall/share/${id}`;
        } else if (userId) {
          endpoint = `https://node.me2vegan.com/api/climbrecords/exploreWall/${userId}`;
        } else {
          endpoint = `https://node.me2vegan.com/api/climbrecords/exploreWall/`;
        }

        const response = await axios.get(endpoint);
        let records = id ? [response.data] : response.data;

        const userNow = getUserFromToken();
        const userIdNow = userNow?.userId;
        if (isRecommended && userIdNow && !id && !userId) {
          const userRecords = await fetchUserRecords(userIdNow);
          const userGyms = new Set(userRecords.map((record) => record.gymName));
          const userLevels = userRecords
            .flatMap((record) => record.records.map((r) => r.level))
            .reduce((acc, level) => {
              acc[level] = (acc[level] || 0) + 1;
              return acc;
            }, {});

          const mostFrequentLevel = Object.keys(userLevels).reduce((a, b) =>
            userLevels[a] > userLevels[b] ? a : b
          );

          records = sortRecordsByUserPreferences(
            records,
            userGyms,
            mostFrequentLevel
          );
        } else {
          records.sort((a, b) => new Date(b.date) - new Date(a.date));
        }

        setRecords(records);
        window.scrollTo(0, 0);
      } catch (error) {
        console.error("Error fetching records:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecords();

    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(loadingTimeout);
  }, [id, userId, isRecommended]);

  const sortRecordsByUserPreferences = (
    records,
    userGyms,
    mostFrequentLevel
  ) => {
    const userGymRecords = [];
    const otherRecords = [];

    records.forEach((record) => {
      if (userGyms.has(record.gymName)) {
        userGymRecords.push(record);
      } else {
        otherRecords.push(record);
      }
    });

    const levelOrder = [
      "V0",
      "V1",
      "V2",
      "V3",
      "V4",
      "V5",
      "V6",
      "V7",
      "V8",
      "V9",
    ];
    const levelIndex = levelOrder.indexOf(mostFrequentLevel);
    const orderedLevels = [
      ...levelOrder.slice(levelIndex),
      ...levelOrder.slice(0, levelIndex),
    ];

    const sortByLevel = (a, b) => {
      const aLevel = a.records.find((rec) => orderedLevels.includes(rec.level));
      const bLevel = b.records.find((rec) => orderedLevels.includes(rec.level));
      return (
        orderedLevels.indexOf(aLevel?.level) -
        orderedLevels.indexOf(bLevel?.level)
      );
    };

    userGymRecords.sort(sortByLevel);
    otherRecords.sort(sortByLevel);

    return [...userGymRecords, ...otherRecords];
  };

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

    if (fileType && fileType.startsWith("video")) {
      return (
        <div key={file} className="file-container-explore">
          <video src={filePath} controls className="file-content" />
        </div>
      );
    } else if (fileType && fileType.startsWith("image")) {
      return (
        <div key={file} className="file-container-explore">
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

  const handleToggleLike = async (recordId, subRecordId, isLiked) => {
    if (!userName) {
      showMessage("請先登入才能按讚！", "error");
      setTimeout(() => {
        navigate("/signin");
      }, 1000);
      return;
    }

    try {
      const url = isLiked
        ? `https://node.me2vegan.com/api/climbrecords/removeLike/${subRecordId}`
        : `https://node.me2vegan.com/api/climbrecords/addLike/${subRecordId}`;
      await axios.post(url, { userId: getUserFromToken().userId });
      setRecords((prevRecords) =>
        prevRecords.map((record) => {
          if (record._id === recordId) {
            return {
              ...record,
              records: record.records.map((rec) => {
                const likedBy = rec.likedBy || [];
                return {
                  ...rec,
                  likes: isLiked ? rec.likes - 1 : rec.likes + 1,
                  likedBy: isLiked
                    ? likedBy.filter((id) => id !== getUserFromToken().userId)
                    : [...likedBy, getUserFromToken().userId],
                };
              }),
            };
          }
          return record;
        })
      );
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const isLikedByUser = (likedBy = []) => {
    const userId = getUserFromToken()?.userId;
    return likedBy.includes(userId);
  };

  const handleAddComment = async (recordId, subRecordId) => {
    const comment = newComment[subRecordId];
    if (!userName) {
      showMessage("請先登入才能留言！", "error");
      setTimeout(() => {
        navigate("/signin");
      }, 1000);
      return;
    }

    if (!comment) {
      showMessage("請輸入內容！", "error");
      return;
    }

    if (commentButtonDisabled[subRecordId]) {
      return;
    }

    setCommentButtonDisabled((prev) => ({ ...prev, [subRecordId]: true }));

    try {
      const fullComment = `${userName}: ${comment}`;
      await axios.post(
        `https://node.me2vegan.com/api/climbrecords/addComment/${subRecordId}`,
        {
          comment: fullComment,
        }
      );

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
      showMessage("留言已送出！", "success");
      setNewComment((prev) => ({ ...prev, [subRecordId]: "" }));
      setShowComments((prev) => ({ ...prev, [subRecordId]: true }));
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setTimeout(() => {
        setCommentButtonDisabled((prev) => ({ ...prev, [subRecordId]: false }));
      }, 5000);
    }
  };

  const handleCommentChange = (subRecordId, value) => {
    setNewComment((prev) => ({ ...prev, [subRecordId]: value }));
  };

  const toggleComments = (subRecordId) => {
    setShowComments((prev) => ({ ...prev, [subRecordId]: !prev[subRecordId] }));
  };

  const handleShare = async (recordId) => {
    const shareLink = `https://rockreach.me2vegan.com/explore/${recordId}`;
    try {
      await navigator.clipboard.writeText(shareLink);
      showMessage("已複製網址到剪貼簿！", "success");
    } catch (error) {
      showMessage("複製網址失敗", "error");
    }
  };

  const handleFilterGymChange = (e) => {
    setFilterGym(e.target.value);
    window.scrollTo(0, 0);
  };

  const handleFilterLevelChange = (e) => {
    setFilterLevel(e.target.value);
    window.scrollTo(0, 0);
  };

  const resetFilters = () => {
    setFilterGym("");
    setFilterLevel("");
    window.scrollTo(0, 0);
  };

  const toggleFilterContainer = () => {
    if (isFilterOpen) {
      document
        .querySelector(".filter-container-box")
        .classList.remove("expanded");
      document
        .querySelector(".filter-container-box")
        .classList.add("collapsed");
      setTimeout(() => {
        setIsFilterOpen(false);
      }, 500);
    } else {
      setIsFilterOpen(true);
      setTimeout(() => {
        document
          .querySelector(".filter-container-box")
          .classList.add("expanded");
        document
          .querySelector(".filter-container-box")
          .classList.remove("collapsed");
      }, 10);
    }
  };

  const filteredRecords = records.filter((record) => {
    const gymMatch = filterGym ? record.gymName === filterGym : true;
    const levelMatch = filterLevel
      ? record.records.some((rec) => rec.level === filterLevel)
      : true;
    return gymMatch && levelMatch;
  });

  const levelOptions = [
    "V0",
    "V1",
    "V2",
    "V3",
    "V4",
    "V5",
    "V6",
    "V7",
    "V8",
    "V9",
  ];

  return (
    <div>
      {!isLoading && !userId && !id && (
        <div>
          <button className="toggle-button" onClick={toggleFilterContainer}>
            <FaFilter />
          </button>
          <div
            className={`filter-container-box ${
              isFilterOpen ? "expanded" : "collapsed"
            }`}
          >
            <div className="filter-container">
              <p>篩選動態</p>
              <select value={filterGym} onChange={handleFilterGymChange}>
                <option value="">指定岩館</option>
                {gymOptions.map((gym) => (
                  <option key={gym._id} value={gym.name}>
                    {gym.name}
                  </option>
                ))}
              </select>
              <select value={filterLevel} onChange={handleFilterLevelChange}>
                <option value="">指定等級</option>
                {levelOptions.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
              <button onClick={resetFilters}>重置篩選</button>
              {getUserFromToken() && <div className="explore-space-div"></div>}
              {getUserFromToken() && (
                <button onClick={() => setIsRecommended(true)}>關聯推薦</button>
              )}
              {getUserFromToken() && (
                <button onClick={() => setIsRecommended(false)}>
                  重置排序
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <Loading />
      ) : filteredRecords.length === 0 ? (
        <p>--- 尚無紀錄 ---</p>
      ) : (
        <div className="explore-container">
          {filteredRecords.map((record) => {
            const currentSlideIndex = currentSlides[record._id] || 0;
            const shouldShowPagination = record.records.some(
              (rec) => rec.files.length > 1
            );
            return (
              <div className="record-card" key={record._id}>
                <div className="record-header">
                  <div className="record-header-basic">
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
                  </div>
                  <div className="user-info-right">
                    <p className="explore-date">{record.date}</p>
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
                    {shouldShowPagination && (
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
                    )}
                  </div>
                  <div className="record-level">
                    <p>等級： {record.records.map((r) => r.level).join(", ")}</p>
                    <p className="record-times">
                      嘗試次數： {record.records.map((r) => r.times).join(", ")}
                    </p>
                  </div>
                  {record.records.some((r) => r.memo) && (
                    <p className="record-memo">
                      {record.records.map((r) => r.memo).join(", ")}
                    </p>
                  )}
                </div>
                {record.records.map((rec) => (
                  <div key={rec._id} className="record-footer">
                    <div className="record-footer1">
                      <div className="likes">
                        <button
                          onClick={() =>
                            handleToggleLike(
                              record._id,
                              rec._id,
                              isLikedByUser(rec.likedBy)
                            )
                          }
                        >
                          {!isLikedByUser(rec.likedBy) ? "👍🏻" : "👍"}{" "}
                          {rec.likes}
                        </button>
                      </div>
                      <div className="comments">
                        <button onClick={() => toggleComments(rec._id)}>
                          💬 {rec.comments.length}
                        </button>
                      </div>
                      <div className="share">
                        <button onClick={() => handleShare(record._id)}>
                          <FaShare />
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
                              required
                            />
                            <button
                              onClick={() =>
                                handleAddComment(record._id, rec._id)
                              }
                              disabled={commentButtonDisabled[rec._id]}
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
    </div>
  );
};

export default Explore;
