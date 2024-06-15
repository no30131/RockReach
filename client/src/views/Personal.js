import React, { useState, useEffect } from "react";
import "./stylesheets/Personal.css";
import Plotly from "plotly.js-dist";
import { jwtDecode } from "jwt-decode";

const Personal = () => {
  const [user, setUser] = useState(null);
  const [climbRecords, setClimbRecords] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = getCookie("token");

      if (!token) {
        console.error("No token found");
        return;
      }

      const decoded = jwtDecode(token);
      const userId = decoded.userId;
      // console.log("userId: ", userId);

      try {
        const userResponse = await fetch(`http://localhost:7000/api/users/${userId}`);
        if (!userResponse.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await userResponse.json();
        // console.log("User data fetched: ", userData);
        setUser(userData);

        const recordsResponse = await fetch(`http://localhost:7000/api/climbRecords/${userId}`)
        if (!recordsResponse.ok) {
          throw new Error("Failed to fetch climb records");
        }

        const recordsData = await recordsResponse.json();
        // console.log("Climb records fetched: ", recordsData);
        setClimbRecords(recordsData);

        // const levelResponse = await fetch
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (climbRecords.length > 0) {
      generateLevelChart();
      generateTypesChart();
      generateFrequencyChart();
    }
  }, [climbRecords]);

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

  const generateLevelChart = () => {
    const levels = climbRecords.flatMap(record => record.records.map(r => r.level));
    // console.log(`flatmap: ${levels}`);
    const levelCounts = levels.reduce((acc, level) => {
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});

    const allLevels = ["V0", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9"];
    const completeLevelCounts = allLevels.reduce((acc, level) => {
      acc[level] = levelCounts[level] || 0;
      return acc;
    }, {});  

    const data = [{
      x: Object.keys(completeLevelCounts),
      y: Object.values(completeLevelCounts),
      type: "bar",
      orientation: 'v'
    }];

    const layout = {
      title: "路線等級統計",
      // xaxis: { title: "數量" },
      yaxis: { 
        categoryorder: "array",
        categoryarray: allLevels
      },
      height: 400,
      width: 600
    };
    
    Plotly.newPlot("level", data, layout);
  };

  const generateTypesChart = () => {
    const types = ["Crimpy", "Dyno", "Slope", "Power", "Pump"];
    const typeCounts = types.reduce((acc, type) => {
      acc[type] = { count: 0, times: 0 };
      return acc;
    }, {});

    climbRecords.forEach(record => {
      record.records.forEach(r => {
        r.types.forEach(type => {
          if (typeCounts[type]) {
            typeCounts[type].count += 1;
            typeCounts[type].times += r.times;
          }
        });
      });
    });

    const colors = ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56', '#2ecc71'];

    const dataCount = [{
      values: types.map(type => typeCounts[type].count),
      labels: types,
      type: "pie",
      textinfo: 'label+percent',
      hole: .4,
      marker: {
        colors: colors
      }
    }];

    const dataTimes = [{
      values: types.map(type => (typeCounts[type].times / typeCounts[type].count).toFixed(1)),
      labels: types,
      type: "pie",
      textinfo: 'label+value',
      hole: .4,
      marker: {
        colors: colors
      }
    }];

    const layoutCount = {
      title: "路線類型分析",
      height: 400,
      width: 600
    };

    const layoutTimes = {
      title: "平均挑戰次數",
      height: 400,
      width: 600
    };

    Plotly.newPlot("typesCount", dataCount, layoutCount);
    Plotly.newPlot("typesTimes", dataTimes, layoutTimes);
  };

  const generateFrequencyChart = () => {
    const dateLevelCounts = climbRecords.reduce((acc, record) => {
      const date = new Date(record.date).toISOString().split("T")[0];
      record.records.forEach(r => {
        const level = r.level;
        if (!acc[date]) {
          acc[date] = {};
        }
        if (!acc[date][level]) {
          acc[date][level] = 0;
        }
        acc[date][level] += 1;
      })
      return acc;
    }, {});

    const dates = Object.keys(dateLevelCounts).sort();
    const levels = ["V0", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9"];
    
    const data = levels.map(level => ({
      x: dates,
      y: dates.map(date => dateLevelCounts[date][level] || 0),
      name: level,
      type: "bar"
    }));

    const layout = {
      title: "攀爬頻率分析",
      xaxis: { title: "日期" },
      yaxis: { title: "路線" },
      barmode: "stack",
      height: 400,
      width: 600
    };

    Plotly.newPlot("frequency", data, layout);
  };

  const renderFile = (file) => {
    const fileTypeMap = {
      'mp4': 'video/mp4',
      'mpeg': 'video/mpeg',
      'avi': 'video/x-msvideo',
      'mov': 'video/quicktime',
      'wmv': 'video/x-ms-wmv',
      'flv': 'video/x-flv',
      'mkv': 'video/x-matroska',
      '3gp': 'video/3gpp',
      '3g2': 'video/3gpp2',
      'hevc': 'video/HEVC',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif'
    };

    const fileExtension = file.split('.').pop().toLowerCase();
    const fileType = fileTypeMap[fileExtension];
    const filePath = `http://localhost:7000/${file}`;
  
    const fileStyle = {
      maxWidth: '320px',
      maxHeight: '240px',
      objectFit: 'contain'
    };

    if (fileType && fileType.startsWith('video')) {
      return <video key={file} src={filePath} controls style={fileStyle} />;
    } else if (fileType && fileType.startsWith('image')) {
      return <img key={file} src={filePath} alt="file" style={fileStyle} />;
    } else {
      return <p key={file}>Unsupported file type</p>;
    }
  };

  // useEffect(() => {
  //   console.log("User state updated: ", user);
  //   console.log("Climb records state updated: ", climbRecords);
  // }, [user, climbRecords]);

  return (
    <div>
      <h1>個人空間</h1>
      {user ? (
        <div>
          <p>{user.name}</p>
          <p>{user.introduce}</p>
          <img src={user.image} alt={user.name} />
        </div>
      ) : (
        <p>Loading user data...</p>
      )}
      <div id="level" style={{ width: 600, height: 400 }}></div>
      <div id="typesCount" style={{ width: 600, height: 400 }}></div>
      <div id="typesTimes" style={{ width: 600, height: 400 }}></div>
      <div id="frequency" style={{ width: 600, height: 400 }}></div>
      <div>
        {climbRecords.map((record) => (
          <div key={record._id} className="personal-records-box">
            <p>Date: {new Date(record.date).toLocaleDateString()}</p>
            <p>Gym ID: {record.gymId}</p>
            <div>
              {record.records.map((rec, index) => (
                <div key={index}>
                  <div className="personal-records">
                    <p>Wall: {rec.wall}</p>
                    <p>Level: {rec.level}</p>
                    <p>Types: {rec.types.join(", ")}</p>
                    <p>Times: {rec.times}</p>
                  </div>
                  <div className="personal-records-memo">Memo: {rec.memo}</div>
                  <div className="personal-records-files">
                    {rec.files.map((file, idx) => (
                    renderFile(file)
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Personal;
