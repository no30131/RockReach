import React, { useState, useEffect } from "react";
import axios from "axios";
import "./stylesheets/Achievements.css";

const Achievement = () => {
  const [walls, setWalls] = useState([]);
  const [selectedWall, setSelectedWall] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [processedImages, setProcessedImages] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:7000/api/customs/achievement/walls")
      .then((response) => {
        setWalls(response.data);
      })
      .catch((error) => {
        console.error("Error fetching walls data:", error);
      });
  }, []);

  const handleWallSelect = (wall) => {
    setSelectedWall(wall);
    setProcessedImages([]);

    axios
      .get(`http://localhost:7000/api/customs/achievement/walls/${wall.wallName}`)
      .then((response) => {
        setRoutes(response.data);
      })
      .catch((error) => {
        console.error("Error fetching wall details:", error);
      });
  };

  const handleRouteSelect = (route) => {
    setSelectedRoute(route);
  };

  // const handleProcessClick = () => {
  //   if (!selectedWall) return;
  //   axios
  //     .post("http://localhost:7000/api/customs/achievement/process", {
  //       image: selectedWall.originalImage,
  //     })
  //     .then((response) => {
  //       setProcessedImages(response.data.processedImages);
  //     })
  //     .catch((error) => {
  //       console.error("Error processing image:", error);
  //     });
  // };

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
          
          {/* <button onClick={handleProcessClick}>Process</button> */}
          {/* {/* */}
          {processedImages.length > 0 && (
            <div className="processed-images">
              {/* <h3>Processed Images:</h3> */}
              {processedImages.map((image, index) => (
                <img
                  key={index}
                  src={`http://localhost:7000/${image}`}
                  alt={`Processed ${index}`}
                />
              ))}
            </div>
          )}
          {/* } */}
          
        </div>
      )}

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
            </div>
          ))}
        </div>
      )}

      {selectedRoute && (
        <div className="route-details">
          <h3>Route Details:</h3>
          <p>Custom Name: {selectedRoute.customName}</p>
          <p>Custom Type: {selectedRoute.customType}</p>
          <p>Memo: {selectedRoute.memo}</p>
          <img src={selectedRoute.processedImage} alt="Processed" />
        </div>
      )}
    </div>
  );
};

export default Achievement;
