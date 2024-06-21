// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { jwtDecode } from "jwt-decode";
// import "./stylesheets/Achievements.css";

// const Achievement = () => {
//   const [walls, setWalls] = useState([]);
//   const [selectedWall, setSelectedWall] = useState(null);
//   const [routes, setRoutes] = useState([]);
//   const [selectedRoute, setSelectedRoute] = useState(null);
//   const [processedImages, setProcessedImages] = useState([]);
//   // const [status, setStatus] = useState("incomplete");
//   const [userId, setUserId] = useState(null);

//   useEffect(() => {
//     const fetchWalls = async () => {
//       try {
//         const response = await axios.get(
//           "http://localhost:7000/api/customs/achievement/walls"
//         );
//         setWalls(response.data);
//         // console.log("Walls fetched:", response.data);
//       } catch (error) {
//         console.error("Error fetching walls data:", error);
//       }
//     };
  
//     const getCookie = (name) => {
//       const cookieArr = document.cookie.split("; ");
//       for (let i = 0; i < cookieArr.length; i++) {
//         const cookiePair = cookieArr[i].split("=");
//         if (name === cookiePair[0]) {
//           return decodeURIComponent(cookiePair[1]);
//         }
//       }
//       return null;
//     };
  
//     const token = getCookie("token");
//     if (token) {
//       const decoded = jwtDecode(token);
//       setUserId(decoded.userId);
//       // console.log("User ID set:", decoded.userId);
//     }
  
//     fetchWalls();
//   }, []);
  

//   const handleWallSelect = (wall) => {
//     setSelectedWall(wall);
//     setProcessedImages([]);
//     // console.log("Selected wall:", wall);

//     axios
//       .get(
//         `http://localhost:7000/api/customs/achievement/walls/${wall.wallName}`
//       )
//       .then((response) => {
//         setRoutes(response.data);
//         // console.log("Routes fetched:", response.data);
//       })
//       .catch((error) => {
//         console.error("Error fetching wall details:", error);
//       });
//   };

//   const handleRouteSelect = (route) => {
//     setSelectedRoute(route);
//     // setStatus("incomplete");
//     // console.log("Selected route:", route);
//   };

//   // const handleAchievementStatusChange = (event) => {
//   //   setStatus(event.target.value);
//   // };

//   const handleSaveAchievement = async () => {
//     if (!userId || !selectedRoute) {
//       // console.log("Missing userId or selectedRoute");
//       return;
//     }
//     try {
//       // console.log("Saving achievement:", { userId, customName: selectedRoute.customName, status });  
//       const response = await axios.post(
//         "http://localhost:7000/api/achievements/create",
//         {
//           userId,
//           customName: selectedRoute.customName,
//           status: "completed",
//         }
//       );

//       if (response.status === 200) {
//         console.log("Achievement saved successfully: ", response.data);
//       } else {
//         console.error("Error saving achievement: ", response.data);
//       }
//     } catch (error) {
//       console.error("Error saving achievement: ", error);
//     }
//   };

//   return (
//     <div>
//       <h1>成就系統</h1>
//       {!selectedWall ? (
//         <div className="walls-list">
//           {walls.map((wall, index) => (
//             <div
//               key={index}
//               className="wall-item"
//               onClick={() => handleWallSelect(wall)}
//             >
//               <h3>{wall.wallName}</h3>
//               <img src={wall.originalImage} alt={wall.wallName} />
//             </div>
//           ))}
//         </div>
//       ) : (
//         <div className="wall-data">
//           <button onClick={() => setSelectedWall(null)}>Back to Walls</button>
//           <h2>{selectedWall.wallName}</h2>
//           <img src={selectedWall.originalImage} alt={selectedWall.wallName} />
//         </div>
//       )}

//       {routes.length > 0 && (
//         <div className="routes-list">
//           <h3>Routes:</h3>
//           {routes.map((route, index) => (
//             <div
//               key={index}
//               className="route-item"
//               onClick={() => handleRouteSelect(route)}
//             >
//               <h4>{route.customName}</h4>
//             </div>
//           ))}
//         </div>
//       )}

//       {selectedRoute && (
//         <div className="route-details">
//           <h3>Route Details:</h3>
//           <p>Custom Name: {selectedRoute.customName}</p>
//           <p>Custom Type: {selectedRoute.customType.join(", ")}</p>
//           <p>Memo: {selectedRoute.memo}</p>
//           <img src={selectedRoute.processedImage} alt="Processed" />
//           <button onClick={handleSaveAchievement}>Complete</button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Achievement;


import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./stylesheets/Achievements.css";

const Achievement = () => {
  const [walls, setWalls] = useState([]);
  const [selectedWall, setSelectedWall] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [status, setStatus] = useState("incomplete");
  const [userId, setUserId] = useState(null);
  const [achievements, setAchievements] = useState({});

  useEffect(() => {
    const fetchWalls = async () => {
      try {
        const response = await axios.get(
          "http://localhost:7000/api/customs/achievement/walls"
        );
        setWalls(response.data);
      } catch (error) {
        console.error("Error fetching walls data:", error);
      }
    };

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

    const token = getCookie("token");
    if (token) {
      const decoded = jwtDecode(token);
      setUserId(decoded.userId);
    }

    fetchWalls();
  }, []);

  const handleWallSelect = async (wall) => {
    setSelectedWall(wall);
    setStatus("incomplete");

    try {
      const routesResponse = await axios.get(
        `http://localhost:7000/api/customs/achievement/walls/${wall.wallName}`
      );
      setRoutes(routesResponse.data);

      const achievementsResponse = await axios.get(
        `http://localhost:7000/api/achievements/${userId}`
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
    setStatus(achievements[route.customName] || "incomplete");
  };

  const handleSaveAchievement = async () => {
    if (!userId || !selectedRoute) return;
    try {
      const response = await axios.post(
        "http://localhost:7000/api/achievements/create",
        {
          userId,
          customName: selectedRoute.customName,
          status: "completed",
        }
      );

      if (response.status === 200 || response.status === 201) {
        console.log("Achievement saved successfully: ", response.data);
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

  const completedCount = routes.filter(route => achievements[route.customName] === "completed").length;

  return (
    <div>
      <h1>成就系統</h1>
      {!selectedWall ? (
        <div className="walls-list">
          {walls.map((wall, index) => (
            <div
              key={index}
              className="wall-item"
              onClick={() => handleWallSelect(wall)}
            >
              <h3>{wall.wallName}</h3>
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
          {routes.length > 0 && (
            <div className="routes-list">
              <h3>Routes:</h3>
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
              <h3>Route Details:</h3>
              <p>Custom Name: {selectedRoute.customName}</p>
              <p>Custom Type: {selectedRoute.customType.join(", ")}</p>
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

export default Achievement;
