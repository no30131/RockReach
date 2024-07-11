import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { getUserFromToken } from "../utils/token";
import "./stylesheets/Custom.css";

const routeTypes = [
  { name: "Crimpy", icon: "/images/icon_crimpy.png" },
  { name: "Dyno", icon: "/images/icon_dyno.png" },
  { name: "Slope", icon: "/images/icon_slope.png" },
  { name: "Power", icon: "/images/icon_power.png" },
  { name: "Pump", icon: "/images/icon_pump.png" },
];

const Custom = ({ showMessage }) => {
  const { id } = useParams();
  const [userId, setUserId] = useState(null);
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
  const [showOutput, setShowOutput] = useState(false);
  const [showSaveArea, setShowSaveArea] = useState(false);

  useEffect(() => {
    const user = getUserFromToken();
    if (user) {
      setUserId(user.userId);
    }
  }, []);

  useEffect(() => {
    if (id) {
      axios
        .get(`https://node.me2vegan.com/api/customs/walls/share/${id}`)
        .then((response) => {
          setSelectedWall({
            wallName: response.data.wallName,
            originalImage: response.data.originalImage,
          });
          setSelectedRoute(response.data.customs[0]);
        })
        .catch((error) => {
          console.error("Error fetching route data:", error);
        });
    } else {
      axios
        .get(`https://node.me2vegan.com/api/customs/walls`)
        .then((response) => {
          setWalls(response.data);
        })
        .catch((error) => {
          console.error("Error fetching walls data:", error);
        });
    }
  }, [id]);

  const handleWallSelect = (wall) => {
    setSelectedWall(wall);
    setMarkers([]);
    setOutputImage(null);
    setOutputDBImage(null);
    setIsCanvasActive(false);
    setIsProcessing(false);
    setScale(1);
    setShowSaveArea(false);
    setShowOutput(false);

    axios
      .get(`https://node.me2vegan.com/api/customs/walls/${wall.wallName}`)
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
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    if (isEraserActive) {
      setMarkers((prevMarkers) =>
        prevMarkers.filter((marker) => {
          const distance = Math.sqrt((marker.x - x) ** 2 + (marker.y - y) ** 2);
          return distance > 10;
        })
      );
    } else {
      setMarkers((prevMarkers) => [...prevMarkers, { x, y }]);
    }
  };

  const handleProcessClick = async () => {
    if (!selectedWall) return;
    setIsProcessing(true);

    try {
      const response = await axios.post(
        "https://node.me2vegan.com/api/customs/process",
        {
          image: selectedWall.originalImage,
          markers: markers.map((marker) => ({
            x: marker.x / scale,
            y: marker.y / scale,
          })),
        }
      );

      setOutputImage(`https://node.me2vegan.com/${response.data.processedImage}`);
      setOutputDBImage(response.data.processedImage);
      setIsProcessing(false);
      setShowOutput(true);
    } catch (error) {
      console.error("Error processing image:", error);
      setIsProcessing(false);
    }
  };

  const handleImageLoad = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
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
      prevTypes.includes(type)
        ? prevTypes.filter((t) => t !== type)
        : [...prevTypes, type]
    );
  };

  const drawMarkers = useCallback(
    (ctx) => {
      markers.forEach((marker) => {
        ctx.fillStyle = isEraserActive ? "blue" : "red";
        ctx.beginPath();
        ctx.arc(marker.x, marker.y, 5, 0, 2 * Math.PI);
        ctx.fill();
      });
    },
    [markers, isEraserActive]
  );

  useEffect(() => {
    if (selectedWall && canvasRef.current) {
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

  const handleConfirmClick = async (e) => {
    e.preventDefault();

    if (!customName) {
      showMessage("請輸入路線名稱！", "error");
      return;
    }

    if (customName.length > 20) {
      showMessage("路線名稱不能超過20個字元！", "error");
      return;
    }

    if (memo.length > 100) {
      showMessage("說明或備註不能超過100個字元！", "error");
      return;
    }

    try {
      const userResponse = await axios.get(
        `https://node.me2vegan.com/api/users/${userId}`
      );
      const userName = userResponse.data.name;

      axios
        .post(`https://node.me2vegan.com/api/customs/create`, {
          wallName: selectedWall.wallName,
          processedImage: outputDBImage,
          userId: userName,
          customName,
          customType,
          memo,
        })
        .then((response) => {
          showMessage("新增路線成功！", "success")
          setSelectedWall(null);
        })
        .catch((error) => {
          console.error("Error saving custom route:", error);
          showMessage("新增路線失敗，請稍後再試", "error");
        });
    } catch (error) {
      console.error("Error fetching data: ", error);
      showMessage("伺服器異常，請稍後再試", "error");
    }
  };

  const handleShare = async (routeId) => {
    const shareLink = `https://rockreach.me2vegan.com/custom/${routeId}`;
    try {
      await navigator.clipboard.writeText(shareLink);
      showMessage("已複製網址到剪貼簿！", "success");
    } catch (error) {
      showMessage("複製網址失敗", "error");
    }
  };

  const handleReturn = () => {
    if (!selectedRoute) {
      setSelectedWall(null);
    } else {
      setSelectedRoute(null);
    }
  };

  const handleAddRoute = () => {
    setIsCanvasActive(true);

    if (selectedRoute) {
      setSelectedRoute(null);
    }
  };

  const handleSave = () => {
    setShowSaveArea(true);
  };

  const handleEdit = () => {
    setShowSaveArea(false);
    setShowOutput(false);
  };

  const getRouteTypeIcon = (typeName) => {
    const type = routeTypes.find((routeType) => routeType.name === typeName);
    return type ? type.icon : "";
  };

  return (
    <div className="custom-page">
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
        <div className="custom-header">
          {!id && (
            <button onClick={handleReturn} className="return-button">
              <img src="/images/undo.png" alt="return" />
            </button>
          )}
          <div
            className={`custom-item-details ${!selectedRoute ? "" : "hidden"}`}
          >
            <div className="custom-item-details-h3-div">
              <h3>{selectedWall.wallName}</h3>
            </div>
            <img
              ref={imgRef}
              src={selectedWall.originalImage}
              alt={selectedWall.wallName}
              style={{ display: "none" }}
              onLoad={handleImageLoad}
            />
            {!id && <canvas ref={canvasRef} onClick={handleImageClick} />}
            {outputImage && (
              <div className="route-output">
                <h3> </h3>
                <img src={outputImage} alt="Output" />
              </div>
            )}
            {!showOutput && isCanvasActive && !id && (
              <div className="adding-custom-area">
                <p>點擊標記路線中的所有岩點，再點執行查看結果</p>
                <div className="adding-custom-buttons">
                  <button
                    onClick={handleProcessClick}
                    className="process-button"
                  >
                    執行
                  </button>
                  <button
                    onClick={() => setIsEraserActive(!isEraserActive)}
                    className="eraser-button"
                  >
                    {isEraserActive ? "使用標記" : "使用橡皮擦"}
                  </button>
                </div>
              </div>
            )}
            {showOutput && (
              <div className="edit-or-save">
                <button onClick={handleSave} className="process-save-button">
                  保存
                </button>
                <button onClick={handleEdit} className="process-edit-button">
                  修改
                </button>
              </div>
            )}
            {outputImage && showSaveArea && !id && (
              <div className="custom-details">
                <form>
                  <input
                    type="text"
                    placeholder="輸入路線名稱*"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="custom-input-name"
                    required
                    maxLength={20}
                  />
                  <div className="route-types-custom">
                    {routeTypes.map((type) => (
                      <div
                        key={type.name}
                        className={`route-type-custom ${
                          customType.includes(type.name) ? "selected" : ""
                        }`}
                        onClick={() => toggleRouteType(type.name)}
                      >
                        <img src={type.icon} alt={type.name} />
                        {/* <p>{type.name}</p> */}
                      </div>
                    ))}
                  </div>
                  <textarea
                    placeholder="輸入說明或備註"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    className="custom-textarea"
                    maxLength={100}
                  />
                  <button
                    type="submit"
                    onClick={handleConfirmClick}
                    className="confirm-button"
                  >
                    上傳
                  </button>
                </form>
              </div>
            )}
          </div>

          {selectedRoute && (
            <div className="route-details">
              <div className="route-details-data">
                <p className="route-details-data-name">
                  {selectedRoute.customName}
                </p>
                <div className="route-types">
                  {selectedRoute.customType.map((type, index) => (
                    <img key={index} src={getRouteTypeIcon(type)} alt={type} />
                  ))}
                </div>
                {selectedRoute.setter && <p>設計者: {selectedRoute.setter}</p>}
                {selectedRoute.memo && (
                  <p className="custom-memo">Memo: {selectedRoute.memo}</p>
                )}
              </div>
              <img src={selectedRoute.processedImage} alt="Processed" />
              {!id && (
                <button
                  onClick={() => handleShare(selectedRoute._id)}
                  className="share-custom-button"
                >
                  分享
                </button>
              )}
            </div>
          )}
          {routes.length > 0 && (
            <div
              className={`route-list-box ${
                !isProcessing && !outputImage && !isCanvasActive && !id
                  ? ""
                  : "hidden"
              }`}
            >
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
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="custom-can-add-button">
            {!isProcessing &&
              !outputImage &&
              !isCanvasActive &&
              !id &&
              userId && (
                <button onClick={handleAddRoute} className="custom-add-button">
                  新增路線
                </button>
              )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Custom;
