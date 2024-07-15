import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import Plotly from "plotly.js-dist";
import { FaTrash } from "react-icons/fa";
import { getUserFromToken } from "../utils/token";
import "./stylesheets/Personal.css";
import Loading from "../components/Loading";
import { useNavigate } from "react-router-dom";

const routeTypes = [
  { name: "Crimpy", icon: "/images/icon_crimpy.png" },
  { name: "Dyno", icon: "/images/icon_dyno.png" },
  { name: "Slope", icon: "/images/icon_slope.png" },
  { name: "Power", icon: "/images/icon_power.png" },
  { name: "Pump", icon: "/images/icon_pump.png" },
];

const Personal = ({ showMessage }) => {
  const [user, setUser] = useState(null);
  const [climbRecords, setClimbRecords] = useState([]);
  const [expandedRecords, setExpandedRecords] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const levelRef = useRef(null);
  const typesCountRef = useRef(null);
  const typesTimesRef = useRef(null);
  const frequencyRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = getUserFromToken();
      if (!user) return;

      const userId = user.userId;

      try {
        const userResponse = await axios.get(
          `https://node.me2vegan.com/api/users/${userId}`
        );
        setUser(userResponse.data);

        const recordsResponse = await axios.get(
          `https://node.me2vegan.com/api/climbRecords/${userId}`
        );
        setClimbRecords(recordsResponse.data);
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();

    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(loadingTimeout);
  }, []);

  const toggleRecordDetails = (recordId) => {
    setExpandedRecords((prevExpandedRecords) => ({
      ...prevExpandedRecords,
      [recordId]: !prevExpandedRecords[recordId],
    }));
  };

  const deleteRecord = async (recordId) => {
    const token = getUserFromToken();
    if (!token) {
      showMessage("登入超時，請重新登入！", "error");
      setTimeout(() => {
        navigate("/signin");
      }, 1000);
      return;
    }

    try {
      await axios.post(
        `https://node.me2vegan.com/api/climbRecords/remove/${recordId}`
      );
      setClimbRecords((prevRecords) =>
        prevRecords.filter((record) => record._id !== recordId)
      );
      showMessage("已刪除紀錄", "success");
    } catch (error) {
      console.error("Error deleting record: ", error);
      showMessage("刪除紀錄失敗，請稍後再試", "error");
    }
  };

  const generateLevelChart = useCallback(() => {
    if (!levelRef.current) return;
  
    const levels = climbRecords.flatMap((record) =>
      record.records.map((r) => r.level)
    );
  
    const levelCounts = levels.reduce((acc, level) => {
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});
  
    const allLevels = [
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
    const colors = ["#888888", "#e5b700", "#ffb6c1", "#ADD8E6", "#8d5524", "#FF0000", "#006400", "00008B", "#800080", "#000000"];

    const data = allLevels.map((level, index) => ({
      x: [level],
      y: [levelCounts[level] || 0],
      type: "bar",
      name: level,
      marker: {
        color: colors[index],
      },
    }));
  
    const maxYValue = Math.max(...data.flatMap((d) => d.y));
  
    const layout = {
      title: "路線等級統計",
      xaxis: { title: "等級" },
      yaxis: {
        title: "次數",
        categoryorder: "array",
        categoryarray: allLevels,
        dtick: 1,
        range: [0, Math.ceil(maxYValue)],
        tickformat: "d",
      },
      height: 380,
      width: 450,
      showlegend: true,
      legend: {
        orientation: "v",
        x: 1,
        y: 1,
        traceorder: "normal",
        font: {
          family: "sans-serif",
          size: 12,
          color: "#000",
        },
      },
    };
  
    Plotly.newPlot(levelRef.current, data, layout);
  }, [climbRecords]);
  
  

  const generateTypesChart = useCallback(() => {
    if (!typesCountRef.current || !typesTimesRef.current) return;

    const types = ["Crimpy", "Dyno", "Slope", "Power", "Pump"];
    const typeCounts = types.reduce((acc, type) => {
      acc[type] = { count: 0, times: 0 };
      return acc;
    }, {});

    climbRecords.forEach((record) => {
      record.records.forEach((r) => {
        r.types.forEach((type) => {
          if (typeCounts[type]) {
            typeCounts[type].count += 1;
            typeCounts[type].times += r.times;
          }
        });
      });
    });

    const filteredTypes = types.filter((type) => typeCounts[type].count > 0);
    const filteredCounts = filteredTypes.map((type) => typeCounts[type].count);
    const filteredTimes = filteredTypes.map((type) =>
      (typeCounts[type].times / typeCounts[type].count).toFixed(1)
    );

    if (filteredTypes.length === 0) {
      typesCountRef.current.style.display = "none";
      typesTimesRef.current.style.display = "none";
      return;
    } else {
      typesCountRef.current.style.display = "block";
      typesTimesRef.current.style.display = "block";
    }

    const colors = ["#ff6384", "#36a2eb", "#cc65fe", "#ffce56", "#2ecc71"];

    const dataCount = [
      {
        values: filteredCounts,
        labels: filteredTypes,
        type: "pie",
        textinfo: "label+percent",
        hole: 0.4,
        marker: {
          colors: colors,
        },
      },
    ];

    const dataTimes = [
      {
        values: filteredTimes,
        labels: filteredTypes,
        type: "pie",
        textinfo: "label+value",
        hole: 0.4,
        marker: {
          colors: colors,
        },
      },
    ];

    const layoutCount = {
      title: "路線類型分析",
      height: 380,
      width: 450,
    };

    const layoutTimes = {
      title: "平均挑戰次數",
      height: 380,
      width: 450,
    };

    Plotly.newPlot(typesCountRef.current, dataCount, layoutCount);
    Plotly.newPlot(typesTimesRef.current, dataTimes, layoutTimes);
  }, [climbRecords]);

  const generateFrequencyChart = useCallback(() => {
    if (!frequencyRef.current) return;

    const dateLevelCounts = climbRecords.reduce((acc, record) => {
      const date = new Date(record.date).toLocaleDateString("zh-TW", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      record.records.forEach((r) => {
        const level = r.level;
        if (!acc[date]) {
          acc[date] = {};
        }
        if (!acc[date][level]) {
          acc[date][level] = 0;
        }
        acc[date][level] += 1;
      });
      return acc;
    }, {});

    const dates = Object.keys(dateLevelCounts).sort();
    // const levels = ["V0", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9"];
    // const colors = ["#888888", "#e5b700", "#ffb6c1", "#ADD8E6", "#8d5524", "#FF0000", "#006400", "#00008B", "#800080", "#000000"];
    const levels = ["V9", "V8", "V7", "V6", "V5", "V4", "V3", "V2", "V1", "V0",  ];
    const colors = ["#000000", "#800080", "#00008B", "#006400", "#FF0000", "#8d5524", "#ADD8E6", "#ffb6c1", "#e5b700", "#888888"];
    
    const data = levels
    .map((level, index) => {
      const yValues = dates.map((date) => dateLevelCounts[date][level] || 0);
      return {
        x: dates,
        y: yValues,
        name: level,
        type: "bar",
        visible: yValues.some((value) => value > 0) ? true : "legendonly",
        marker: { color: colors[index] },
      };
    })
    .filter(
      (item) =>
        item.visible !== "legendonly" || item.y.some((value) => value > 0)
    );
    
    const totalCounts = dates.map(date => 
      levels.reduce((sum, level) => sum + (dateLevelCounts[date][level] || 0), 0)
    );
    const maxTotalCount = Math.max(...totalCounts);
  
    const layout = {
      title: "攀爬頻率分析",
      xaxis: { title: "日期" },
      yaxis: {
        title: {
          text: "等級 & 次數",
          standoff: 20,
        },
        automargin: true,
        dtick: 1,
        range: [0, Math.ceil(maxTotalCount)],
        tickformat: "d"
      },
      barmode: "stack",
      height: 380,
      width: 450,
      showlegend: true,
    };

    Plotly.newPlot(frequencyRef.current, data, layout);
  }, [climbRecords]);

  useEffect(() => {
    if (climbRecords.length > 0) {
      generateLevelChart();
      generateTypesChart();
      generateFrequencyChart();
    }
  }, [
    climbRecords,
    generateLevelChart,
    generateTypesChart,
    generateFrequencyChart,
  ]);

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

  const getRouteTypeIcon = (typeName) => {
    const type = routeTypes.find((routeType) => routeType.name === typeName);
    return type ? type.icon : "";
  };

  return (
    <div className="personal-container">
      {!user & !isLoading ? (
        <p>請先登入！</p>
      ) : isLoading ? (
        <Loading />
      ) : (
        <>
          <div className="userData">
            <div className="userData-img">
              <img src={user.image} alt={user.name} />
            </div>
            <div className="userData-details">
              <p className="user-name">{user.name}</p>
              <p>{user.introduce}</p>
            </div>
          </div>
          <h3>個人化分析</h3>
          {climbRecords.length === 0 ? (
            <p>--- 尚無紀錄 ---</p>
          ) : (
            <div className="personal-charts">
              <div id="typesCount" ref={typesCountRef}></div>
              <div id="typesTimes" ref={typesTimesRef}></div>
              <div id="level" ref={levelRef}></div>
              <div id="frequency" ref={frequencyRef}></div>
            </div>
          )}
          <div className="personal-records-box-container">
            <h3>攀岩紀錄</h3>
            {climbRecords.length === 0 && <p>--- 尚無紀錄 ---</p>}
            <div className="personal-records-box-area">
              {climbRecords.map((record) => (
                <div key={record._id} className="personal-records-box">
                  <div
                    onClick={() => toggleRecordDetails(record._id)}
                    className="personal-records-summary"
                  >
                    <p>{new Date(record.date).toLocaleDateString()}</p>
                    <p className="personal-records-gym">{record.gymName}</p>
                    <p>路線數量: {record.records.length}</p>
                  </div>
                  {expandedRecords[record._id] && (
                    <div className="personal-records-details">
                      {record.records.map((rec, index) => (
                        <div key={index}>
                          <div className="personal-records">
                            <p>等級: {rec.level}</p>
                            {rec.wall && <p>牆面: {rec.wall}</p>}
                            {rec.times && <p>嘗試次數: {rec.times}</p>}
                            {rec.types.length > 0 && (
                              <div className="personal-records-route-types">
                                <p>類型: </p>
                                {rec.types.map((type, index) => (
                                  <img
                                    key={index}
                                    src={getRouteTypeIcon(type)}
                                    alt={type}
                                    style={{ width: "30px", height: "38px" }}
                                  />
                                ))}
                              </div>
                            )}
                            <div className={rec.types.length > 0 ? "delete-button-area" : "delete-button-area2"}>
                              <button
                                onClick={() => deleteRecord(record._id)}
                                className="delete-button"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                          {rec.memo && (
                            <div className="personal-records-memo">
                              Memo: {rec.memo}
                            </div>
                          )}
                          {rec.files.length > 0 && (
                            <div className="personal-records-files">
                              {rec.files.map((file, idx) => renderFile(file))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Personal;
