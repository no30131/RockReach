import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./stylesheets/Custom.css";

const Custom = () => {
  const [walls, setWalls] = useState([]);
  const [selectedWall, setSelectedWall] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [outputImage, setOutputImage] = useState(null);
  const [isEraserActive, setIsEraserActive] = useState(false);
  const [isCanvasActive, setIsCanvasActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customType, setCustomType] = useState("");
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
    setIsCanvasActive(false);
    setIsProcessing(false);
    setScale(1);
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
        setOutputImage(`http://localhost:7000/${response.data.processedImage}?timestamp=${new Date().getTime()}`);
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

  const drawMarkers = (ctx) => {
    markers.forEach((marker) => {
      ctx.fillStyle = isEraserActive ? "blue" : "red";
      ctx.beginPath();
      ctx.arc(marker.x, marker.y, 5, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

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
  }, [markers, isEraserActive]);

  const handleConfirmClick = () => {
    axios
      .post("http://localhost:7000/api/customs/create", {
        wallName: selectedWall.wallName,
        processedImage: outputImage,
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
              <button onClick={handleConfirmClick}>Confirm and Save</button>
            </div>
          )}
          {!isProcessing && !outputImage && (
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
              />
              <input
                type="text"
                placeholder="Custom Type"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
              />
              <textarea
                placeholder="Memo"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Custom;
