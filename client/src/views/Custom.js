import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./stylesheets/Custom.css";

const Custom = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [outputImage, setOutputImage] = useState(null);
  const [isEraserActive, setIsEraserActive] = useState(false);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setMarkers([]);
    setOutputImage(null);
  };

  const handleImageClick = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (isEraserActive) {
      setMarkers((prevMarkers) => prevMarkers.filter(marker => {
        const distance = Math.sqrt((marker.x - x) ** 2 + (marker.y - y) ** 2);
        return distance > 10; // Adjust the eraser radius as needed
      }));
    } else {
      setMarkers((prevMarkers) => [...prevMarkers, { x, y }]);
    }
  };

  const handleProcessClick = () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("markers", JSON.stringify(markers));

    axios
      .post("http://localhost:7000/api/custom/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        const imageUrl = URL.createObjectURL(new Blob([response.data]));
        setOutputImage(imageUrl);
      })
      .catch((error) => {
        console.error("Error processing image:", error);
      });
  };

  const handleImageLoad = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = imgRef.current;
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
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
    if (selectedFile) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(imgRef.current, 0, 0);
      drawMarkers(ctx);
    }
  }, [markers, selectedFile, isEraserActive]);

  return (
    <div>
      <h1>自訂路線</h1>
      <input type="file" onChange={handleFileChange} />
      {selectedFile && (
        <div>
          <canvas ref={canvasRef} onClick={handleImageClick} />
          <img
            ref={imgRef}
            src={URL.createObjectURL(selectedFile)}
            alt="Selected"
            style={{ display: "none" }}
            onLoad={handleImageLoad}
          />
        </div>
      )}
      {outputImage && (
        <div>
          <h3>Output Image:</h3>
          <img src={outputImage} alt="Output" />
        </div>
      )}
      {selectedFile && (
        <div>
          <button onClick={handleProcessClick}>Process</button>
          <button onClick={() => setIsEraserActive(!isEraserActive)}>
            {isEraserActive ? "Switch to Marker" : "Switch to Eraser"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Custom;
