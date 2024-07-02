import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import Plotly from "plotly.js-dist";
import { jwtDecode } from "jwt-decode";
import "./stylesheets/Personal.css";

const routeTypes = [
  { name: "Crimpy", icon: "/images/icon_crimpy.png" },
  { name: "Dyno", icon: "/images/icon_dyno.png" },
  { name: "Slope", icon: "/images/icon_slope.png" },
  { name: "Power", icon: "/images/icon_power.png" },
  { name: "Pump", icon: "/images/icon_pump.png" },
];

const Personal = () => {
  const [user, setUser] = useState(null);
  const [climbRecords, setClimbRecords] = useState([]);
  const [expandedRecords, setExpandedRecords] = useState({});

  const levelRef = useRef(null);
  const typesCountRef = useRef(null);
  const typesTimesRef = useRef(null);
  const frequencyRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = getCookie("token");

      if (!token) {
        console.error("No token found");
        return;
      }

      const decoded = jwtDecode(token);
      const userId = decoded.userId;

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
      }
    };

    fetchUserData();
  }, []);

  const toggleRecordDetails = (recordId) => {
    setExpandedRecords((prevExpandedRecords) => ({
      ...prevExpandedRecords,
      [recordId]: !prevExpandedRecords[recordId],
    }));
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
    const completeLevelCounts = allLevels.reduce((acc, level) => {
      acc[level] = levelCounts[level] || 0;
      return acc;
    }, {});

    const data = [
      {
        x: Object.keys(completeLevelCounts),
        y: Object.values(completeLevelCounts),
        type: "bar",
        orientation: "v",
      },
    ];

    const layout = {
      title: "路線等級統計",
      yaxis: {
        categoryorder: "array",
        categoryarray: allLevels,
      },
      height: 400,
      width: 600,
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

    const colors = ["#ff6384", "#36a2eb", "#cc65fe", "#ffce56", "#2ecc71"];

    const dataCount = [
      {
        values: types.map((type) => typeCounts[type].count),
        labels: types,
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
        values: types.map((type) =>
          (typeCounts[type].times / typeCounts[type].count).toFixed(1)
        ),
        labels: types,
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
      height: 400,
      width: 600,
    };

    const layoutTimes = {
      title: "平均挑戰次數",
      height: 400,
      width: 600,
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
    const levels = ["V0", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9"];

    const data = levels.map((level) => ({
      x: dates,
      y: dates.map((date) => dateLevelCounts[date][level] || 0),
      name: level,
      type: "bar",
    }));

    const layout = {
      title: "攀爬頻率分析",
      xaxis: { title: "日期" },
      yaxis: { title: "路線" },
      barmode: "stack",
      height: 400,
      width: 600,
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
    //   margin: "10px",
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

  const getRouteTypeIcon = (typeName) => {
    const type = routeTypes.find((routeType) => routeType.name === typeName);
    return type ? type.icon : "";
  };

  return (
    <div>
      {!user ? (
        <p>請先登入！</p>
      ) : (
        <div className="personal-container">
          <div className="userData">
            <div className="userData-img">
              <img src={user.image} alt={user.name} />
            </div>
            <div className="userData-details">
              <p className="user-name">{user.name}</p>
              <p>{user.introduce}</p>
            </div>
          </div>

          <div
            id="level"
            ref={levelRef}
            style={{ width: 600, height: 400 }}
          ></div>
          <div
            id="typesCount"
            ref={typesCountRef}
            style={{ width: 600, height: 400 }}
          ></div>
          <div
            id="typesTimes"
            ref={typesTimesRef}
            style={{ width: 600, height: 400 }}
          ></div>
          <div
            id="frequency"
            ref={frequencyRef}
            style={{ width: 600, height: 400 }}
          ></div>
          <div>
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
      )}
    </div>
  );
};

export default Personal;
