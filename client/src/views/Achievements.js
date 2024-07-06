import React, { useState, useEffect } from "react";
import axios from "axios";
// import { jwtDecode } from "jwt-decode";
import { getUserFromToken } from "../utils/token"
import "./stylesheets/Achievements.css";

const routeTypes = [
  { name: "Crimpy", icon: "/images/icon_crimpy.png" },
  { name: "Dyno", icon: "/images/icon_dyno.png" },
  { name: "Slope", icon: "/images/icon_slope.png" },
  { name: "Power", icon: "/images/icon_power.png" },
  { name: "Pump", icon: "/images/icon_pump.png" }
];

const Achievements = () => {
  const [walls, setWalls] = useState([]);
  const [selectedWall, setSelectedWall] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  // const [status, setStatus] = useState("incomplete");
  const [userId, setUserId] = useState(null);
  const [achievements, setAchievements] = useState({});

  useEffect(() => {
    const fetchWalls = async () => {
      try {
        const response = await axios.get(
          `https://node.me2vegan.com/api/customs/achievement/walls`
        );
        setWalls(response.data);
      } catch (error) {
        console.error("Error fetching walls data:", error);
      }
    };

    // const getCookie = (name) => {
    //   const cookieArr = document.cookie.split("; ");
    //   for (let i = 0; i < cookieArr.length; i++) {
    //     const cookiePair = cookieArr[i].split("=");
    //     if (name === cookiePair[0]) {
    //       return decodeURIComponent(cookiePair[1]);
    //     }
    //   }
    //   return null;
    // };

    // const token = getCookie("token");
    // if (token) {
    //   const decoded = jwtDecode(token);
    //   setUserId(decoded.userId);
    // }

    const user = getUserFromToken();
    if (user) {
      setUserId(user.userId);
      // console.log("userId: ", user.userId);
    } else {
      console.error("No user found");
    }

    fetchWalls();
  }, []);

  const handleWallSelect = async (wall) => {
    setSelectedWall(wall);
    // setStatus("incomplete");

    try {
      const routesResponse = await axios.get(
        `https://node.me2vegan.com/api/customs/achievement/walls/${wall.wallName}`
      );
      setRoutes(routesResponse.data.customs);

      const achievementsResponse = await axios.get(
        `https://node.me2vegan.com/api/achievements/${userId}`
      );
      const userAchievements = achievementsResponse.data.reduce((acc, achievement) => {
        acc[achievement.customName] = achievement.status;
        return acc;
      }, {});
      setAchievements(userAchievements);
    } catch (error) {
      console.error("Error fetching wall details or achievements:", error);
    }
  };

  const handleRouteSelect = (route) => {
    setSelectedRoute(route);
    // setStatus(achievements[route.customName] || "incomplete");
  };

  const handleSaveAchievement = async () => {
    if (!userId || !selectedRoute) return;
    try {
      const response = await axios.post(
        `https://node.me2vegan.com/api/achievements/create`,
        {
          userId,
          customName: selectedRoute.customName,
          status: "completed",
        }
      );

      if (response.status === 200 || response.status === 201) {
        // console.log("Achievement saved successfully: ", response.data);
        setAchievements({
          ...achievements,
          [selectedRoute.customName]: "completed",
        });
      } else {
        console.error("Error saving achievement: ", response.data);
      }
    } catch (error) {
      console.error("Error saving achievement: ", error);
    }
  };

  const handleShare = () => {
    const shareLink = `https://rockreach.me2vegan.com/achievement/${userId}/${selectedWall.wallName}`;
    prompt("Share this link:", shareLink);
  };

  const completedCount = routes.filter(route => achievements[route.customName] === "completed").length;

  const getRouteTypeIcon = (typeName) => {
    const type = routeTypes.find((routeType) => routeType.name === typeName);
    return type ? type.icon : "";
  };

  return (
    <div>
      {!selectedWall ? (
        <div className="walls-list">
          {walls.map((wall, index) => (
            <div
              key={index}
              className="wall-item"
              onClick={() => handleWallSelect(wall)}
            >
              <h4>{wall.wallName}</h4>
              <img src={wall.originalImage} alt={wall.wallName} />
            </div>
          ))}
        </div>
      ) : (
        <div className="wall-data">
          <button onClick={() => setSelectedWall(null)}>Back to Walls</button>
          <h2>{selectedWall.wallName}</h2>
          <img src={selectedWall.originalImage} alt={selectedWall.wallName} />
          <p>已完成數量: {completedCount}/{routes.length}</p>
          <button onClick={handleShare}>分享</button>
          {routes.length > 0 && (
            <div className="routes-list">
              <h4>Routes:</h4>
              {routes.map((route, index) => (
                <div
                  key={index}
                  className="route-item"
                  onClick={() => handleRouteSelect(route)}
                >
                  <h4>{route.customName}</h4>
                  {achievements[route.customName] === "completed" && <span>已完成</span>}
                </div>
              ))}
            </div>
          )}
          {selectedRoute && (
            <div className="route-details">
              <h4>Route Details:</h4>
              <p>Custom Name: {selectedRoute.customName}</p>
              <div className="route-types">
                Custom Types: 
                {selectedRoute.customType.map((type, index) => (
                  <img key={index} src={getRouteTypeIcon(type)} alt={type} />
                ))}
              </div>
              <p>Memo: {selectedRoute.memo}</p>
              <img src={selectedRoute.processedImage} alt="Processed" />
              {achievements[selectedRoute.customName] !== "completed" && (
                <button onClick={handleSaveAchievement}>完成</button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Achievements;
