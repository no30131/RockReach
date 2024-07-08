import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./stylesheets/Achievements.css";

const routeTypes = [
  { name: "Crimpy", icon: "/images/icon_crimpy.png" },
  { name: "Dyno", icon: "/images/icon_dyno.png" },
  { name: "Slope", icon: "/images/icon_slope.png" },
  { name: "Power", icon: "/images/icon_power.png" },
  { name: "Pump", icon: "/images/icon_pump.png" },
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

  const handleReturn = () => {
    if (selectedRoute) {
      setSelectedRoute(null);
    }
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
          {selectedRoute && (
            <button onClick={handleReturn} className="return-button">
              <img src="/images/undo.png" alt="return" />
            </button>
          )}
          <div
            className={`custom-item-details ${!selectedRoute ? "" : "hidden"}`}
          >
            <div className="custom-item-details-h3-div">
              <h3>{wallName}</h3>
            </div>
            <img src={wall.originalImage} alt={wallName} />
            <p>
              已完成數量: {completedCount}/{routes.length}
            </p>
          </div>

          {selectedRoute && (
            <div className="route-details">
              <div className="route-details-data">
                <p>路線名稱: {selectedRoute.customName}</p>
                <div className="route-types">
                  路線類型:
                  {selectedRoute.customType.map((type, index) => (
                    <img key={index} src={getRouteTypeIcon(type)} alt={type} />
                  ))}
                </div>
                {selectedRoute.memo && <p>Memo: {selectedRoute.memo}</p>}
              </div>
              <img src={selectedRoute.processedImage} alt="Processed" />
            </div>
          )}
          {routes.length > 0 && (
            <div className="route-list-box">
              <div className="routes-list">
                <h4>路線列表:</h4>
                {routes.map((route, index) => (
                  <div
                    key={index}
                    className={`route-item ${
                      selectedRoute &&
                      selectedRoute.customName === route.customName
                        ? "selected"
                        : ""
                    }`}
                    onClick={() => handleRouteSelect(route)}
                  >
                    <h4>{route.customName}</h4>
                    {achievements[route.customName] === "completed" && (
                      <pre className="completed-text">  已完成！</pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AchievementDetails;
