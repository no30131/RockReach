import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./stylesheets/Achievements.css";

const routeTypes = [
  { name: "Crimpy", icon: "/images/icon_crimpy.png" },
  { name: "Dyno", icon: "/images/icon_dyno.png" },
  { name: "Slope", icon: "/images/icon_slope.png" },
  { name: "Power", icon: "/images/icon_power.png" },
  { name: "Pump", icon: "/images/icon_pump.png" }
];

const AchievementDetails = () => {
  const { userId, wallName } = useParams();
  const [wall, setWall] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [achievements, setAchievements] = useState({});

  useEffect(() => {
    const fetchWallAndAchievements = async () => {
      try {
        const wallResponse = await axios.get(
          `https://node.me2vegan.com/api/customs/achievement/walls/${wallName}`
        );
        setWall(wallResponse.data);
        setRoutes(wallResponse.data.customs);
        const achievementsResponse = await axios.get(
          `https://node.me2vegan.com/api/achievements/${userId}`
        );
        const userAchievements = achievementsResponse.data.reduce(
          (acc, achievement) => {
            acc[achievement.customName] = achievement.status;
            return acc;
          },
          {}
        );
        setAchievements(userAchievements);
      } catch (error) {
        console.error("Error fetching wall or achievements data:", error);
      }
    };

    fetchWallAndAchievements();
  }, [userId, wallName]);

  const handleRouteSelect = (route) => {
    setSelectedRoute(route);
  };

  const completedCount = routes.filter(
    (route) => achievements[route.customName] === "completed"
  ).length;

  const getRouteTypeIcon = (typeName) => {
    const type = routeTypes.find((routeType) => routeType.name === typeName);
    return type ? type.icon : "";
  };

  return (
    <div>
      {routes.length > 0 && (
        <div className="wall-data">
          <h2>{wallName}</h2>
          <img src={wall.originalImage} alt={wallName} />
          <p>
            已完成數量: {completedCount}/{routes.length}
          </p>
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
                  {achievements[route.customName] === "completed" && (
                    <span>已完成</span>
                  )}
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
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AchievementDetails;
