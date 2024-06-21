import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import "./stylesheets/Custom.css";

const routeTypes = [
  { name: "Crimpy", icon: "../images/crimpyIcon.png" },
  { name: "Dyno", icon: "../images/dynoIcon.png" },
  { name: "Slope", icon: "../images/slopeIcon.png" },
  { name: "Power", icon: "../images/powerIcon.png" },
  { name: "Pump", icon: "../images/pumpIcon.png" }
];

const Custom = () => {
  const [walls, setWalls] = useState([]);
  const [selectedWall, setSelectedWall] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [outputImage, setOutputImage] = useState(null);
  const [outputDBImage, setOutputDBImage] = useState(null);
  const [isEraserActive, setIsEraserActive] = useState(false);
  const [isCanvasActive, setIsCanvasActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customType, setCustomType] = useState([]);
  const [memo, setMemo] = useState("");
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    axios
      .get("http://localhost:7000/api/customs/walls")
      .then((response) => {
        setWalls(response.data);
      })
      .catch((error) => {
        console.error("Error fetching walls data:", error);
      });
  }, []);

  const handleWallSelect = (wall) => {
    setSelectedWall(wall);
    setMarkers([]);
    setOutputImage(null);
    setOutputDBImage(null);
    setIsCanvasActive(false);
    setIsProcessing(false);
    setScale(1);

    axios
      .get(`http://localhost:7000/api/customs/walls/${wall.wallName}`)
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

  const handleImageClick = (event) => {
    if (!isCanvasActive) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    if (isEraserActive) {
      setMarkers((prevMarkers) =>
        prevMarkers.filter((marker) => {
          const distance = Math.sqrt(
            (marker.x - x) ** 2 + (marker.y - y) ** 2
          );
          return distance > 10;
        })
      );
    } else {
      setMarkers((prevMarkers) => [...prevMarkers, { x, y }]);
    }
  };

  const handleProcessClick = () => {
    if (!selectedWall) return;
    setIsProcessing(true);
    axios
      .post("http://localhost:7000/api/customs/process", {
        image: selectedWall.originalImage,
        markers: markers.map(marker => ({ x: marker.x / scale, y: marker.y / scale })),
      })
      .then((response) => {
        setOutputImage(`http://localhost:7000/${response.data.processedImage}`);
        setOutputDBImage(response.data.processedImage);
        setIsProcessing(false);
      })
      .catch((error) => {
        console.error("Error processing image:", error);
        setIsProcessing(false);
      });
  };

  const handleImageLoad = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = imgRef.current;

    const maxHeight = 500;
    const imgScale = img.height > maxHeight ? maxHeight / img.height : 1;
    setScale(imgScale);

    canvas.width = img.width * imgScale;
    canvas.height = img.height * imgScale;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    drawMarkers(ctx);
  };

  const toggleRouteType = (type) => {
    setCustomType((prevTypes) => 
      prevTypes.includes(type) ? prevTypes.filter(t => t !== type) : [...prevTypes, type]
    );
  };

  const drawMarkers = useCallback((ctx) => {
    markers.forEach((marker) => {
      ctx.fillStyle = isEraserActive ? "blue" : "red";
      ctx.beginPath();
      ctx.arc(marker.x, marker.y, 5, 0, 2 * Math.PI);
      ctx.fill();
    });
  }, [markers, isEraserActive]);

  useEffect(() => {
    if (selectedWall) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (imgRef.current.complete) {
        ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);
        drawMarkers(ctx);
      } else {
        imgRef.current.onload = () => {
          ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);
          drawMarkers(ctx);
        };
      }
    }
  }, [markers, isEraserActive, drawMarkers, selectedWall]);

  const handleConfirmClick = () => {
    axios
      .post("http://localhost:7000/api/customs/create", {
        wallName: selectedWall.wallName,
        processedImage: outputDBImage,
        customName,
        customType,
        memo,
      })
      .then((response) => {
        setSelectedWall(null);
      })
      .catch((error) => {
        console.error("Error saving custom route:", error);
      });
  };

  return (
    <div>
      <h1>自訂路線</h1>
      {!selectedWall ? (
        <div className="walls-list">
          {walls.map((wall, index) => (
            <div key={index} className="wall-item" onClick={() => handleWallSelect(wall)}>
              <h3>{wall.wallName}</h3>
              <img src={wall.originalImage} alt={wall.wallName} />
            </div>
          ))}
        </div>
      ) : (
        <div>
          <button onClick={() => setSelectedWall(null)}>Back to Walls</button>
          <h2>{selectedWall.wallName}</h2>
          <img
            ref={imgRef}
            src={selectedWall.originalImage}
            alt={selectedWall.wallName}
            style={{ display: "none" }}
            onLoad={handleImageLoad}
          />
          <canvas ref={canvasRef} onClick={handleImageClick} />
          {outputImage && (
            <div className="route-output">
              <h3>Output Image:</h3>
              <img src={outputImage} alt="Output" />
            </div>
          )}
          {!isProcessing && !outputImage && !isCanvasActive && (
            <button onClick={() => setIsCanvasActive(true)}>新增路線</button>
          )}
          {isCanvasActive && (
            <div>
              <button onClick={handleProcessClick}>Process</button>
              <button onClick={() => setIsEraserActive(!isEraserActive)}>
                {isEraserActive ? "Switch to Marker" : "Switch to Eraser"}
              </button>
            </div>
          )}
          {outputImage && (
            <div>
              <input
                type="text"
                placeholder="Custom Name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                required
              />
              <div className="route-types">
                {routeTypes.map((type) => (
                  <div 
                    key={type.name}
                    className={`route-type ${customType.includes(type.name) ? "selected" : ""}`}
                    onClick={() => toggleRouteType(type.name)}
                  >
                    <img src={type.icon} alt={type.name} />
                    <p>{type.name}</p>
                  </div>
                ))}
              </div>
              {/* <input
                type="text"
                placeholder="Custom Type"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                required
              /> */}
              <textarea
                placeholder="Memo"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
              <button onClick={handleConfirmClick}>Save</button>
            </div>
          )}

          {routes.length > 0 && (
            <div className="routes-list">
              <h3>Routes:</h3>
              {routes.map((route, index) => (
                <div key={index} className="route-item" onClick={() => handleRouteSelect(route)}>
                  <h4>{route.customName}</h4>
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
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default Custom;
