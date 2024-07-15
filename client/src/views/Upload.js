import React, { useState, useEffect } from "react";
import axios from "axios";
import { deleteToken, getUserFromToken } from "../utils/token";
import "./stylesheets/Upload.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";

const routeTypes = [
  { name: "Crimpy", icon: "/images/icon_crimpy.png" },
  { name: "Dyno", icon: "/images/icon_dyno.png" },
  { name: "Slope", icon: "/images/icon_slope.png" },
  { name: "Power", icon: "/images/icon_power.png" },
  { name: "Pump", icon: "/images/icon_pump.png" },
];

const difficultyLevels = [
  "V0",
  "V1",
  "V2",
  "V3",
  "V4",
  "V5",
  "V6",
  "V7",
  "V8",
  "V9",
];

const Upload = ({ showMessage }) => {
  const [climbDate, setClimbDate] = useState(new Date());
  const [gyms, setGyms] = useState([]);
  const [selectedGym, setSelectedGym] = useState("");
  const [userId, setUserId] = useState(null);
  const [currentRecord, setCurrentRecord] = useState({
    wall: "",
    level: "",
    types: [],
    times: 1,
    memo: "",
    files: [],
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGyms = async () => {
      try {
        const response = await axios.get(
          `https://node.me2vegan.com/api/gyms/all`
        );
        const gymsWithPlaceholder = [
          { _id: "", name: "請選擇岩館" },
          ...response.data,
        ];
        setGyms(gymsWithPlaceholder);
        setSelectedGym("");
      } catch (error) {
        console.error("Error fetching gyms: ", error);
      }
    };

    fetchGyms();

    const user = getUserFromToken();
    if (user) {
      setUserId(user.userId);
    } else {
      console.error("請先登入！");
    }
  }, []);

  const handleChange = (e) => {
    setSelectedGym(e.target.value);
  };

  const handleRecordChange = (e) => {
    const { name, value } = e.target;
    setCurrentRecord({ ...currentRecord, [name]: value });
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    setCurrentRecord({
      ...currentRecord,
      files: Array.from(files).slice(0, 5),
    });
  };

  const handleLevelChange = (level) => {
    setCurrentRecord({ ...currentRecord, level });
  };

  const handleTimesChange = (delta) => {
    const newTimes = Math.max(1, currentRecord.times + delta);
    setCurrentRecord({ ...currentRecord, times: newTimes });
  };

  const toggleRouteType = (type) => {
    const newTypes = currentRecord.types.includes(type)
      ? currentRecord.types.filter((t) => t !== type)
      : [...currentRecord.types, type];
    setCurrentRecord({ ...currentRecord, types: newTypes });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = getUserFromToken();
    if (!token) {
      deleteToken();
      showMessage("登入超時，請重新登入！", "error");
      setTimeout(() => {
        navigate("/signin");
      }, 1000);
      return;
    }

    if (!selectedGym) {
      showMessage("請選擇岩館！", "error");
      return;
    }

    if (!currentRecord.level) {
      showMessage("請選擇難度等級", "error");
      return;
    }

    if (currentRecord.wall && currentRecord.wall.length > 3) {
      showMessage("牆面編號不能超過3個字元！", "error");
      return;
    }

    if (currentRecord.memo && currentRecord.memo.length > 100) {
      showMessage("備註不能超過100個字元！", "error");
      return;
    }

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("date", climbDate.toISOString());
    formData.append("gymName", selectedGym);

    const recordsArray = [currentRecord];
    formData.append("records", JSON.stringify(recordsArray));

    currentRecord.files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await axios.post(
        `https://node.me2vegan.com/api/climbRecords/create`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) {
        showMessage("紀錄上傳成功！", "success");
        navigate("/personal");
      } else {
        console.error("Error uploading records: ", response.data);
        showMessage("紀錄上傳失敗！", "error");
      }
    } catch (error) {
      console.error("Error uploading file: ", error);
      showMessage("伺服器異常，請稍後再試！", "error");
    }
  };

  return (
    <div>
      {!userId ? (
        <p>請先登入！</p>
      ) : (
        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-section">
            <div className="upload-form-hori">
              <div className="upload-form-hori-div">
                <div className="upload-form-hori-div-hori">
                  <p className="upload-steps">1</p>
                  <p className="upload-steps-title">日期</p>
                </div>
                <div className="upload-form-hori-div-vert">
                  <DatePicker
                    className="upload-form-hori-div-vert-date"
                    selected={climbDate}
                    onChange={(date) => setClimbDate(date)}
                    dateFormat="yyyy/MM/dd"
                    maxDate={new Date()}
                  />
                </div>
              </div>
              <div className="upload-form-hori-div">
                <div className="upload-form-hori-div-hori">
                  <p className="upload-steps">2</p>
                  <p className="upload-steps-title">岩館</p>
                </div>
                <div className="upload-form-hori-div-vert">
                  <select
                    className="upload-form-hori-div-vert-select"
                    value={selectedGym}
                    onChange={handleChange}
                    required
                  >
                    {gyms.map((gym) => (
                      <option key={gym._id} value={gym.name}>
                        {gym.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="upload-form-details">
              <div className="upload-form-hori-div">
                <div className="upload-form-hori-div-hori">
                  <p className="upload-steps">3</p>
                  <p className="upload-steps-title">難度等級</p>
                  <p className="upload-steps-title-star">*</p>
                </div>
                <div className="upload-form-hori-div-vert">
                  <div className="difficulty-levels">
                    {difficultyLevels.map((level) => (
                      <button
                        type="button"
                        key={level}
                        className={
                          currentRecord.level === level ? "selected" : ""
                        }
                        onClick={() => handleLevelChange(level)}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="upload-form-hori hori2">
              <div className="upload-form-hori-div">
                <div className="upload-form-hori-div-hori">
                  <p className="upload-steps">4</p>
                  <p className="upload-steps-title">牆面</p>
                </div>
                <div className="upload-form-hori-div-vert">
                  <input
                    type="text"
                    name="wall"
                    value={currentRecord.wall}
                    onChange={handleRecordChange}
                    placeholder="牆面編號 ( 非必填 )"
                    className="wall-input"
                    maxLength={3}
                  />
                </div>
              </div>
              <div className="upload-form-hori-div">
                <div className="upload-form-hori-div-hori">
                  <p className="upload-steps">5</p>
                  <p className="upload-steps-title">嘗試次數</p>
                </div>
                <div className="upload-form-hori-div-vert">
                  <div className="attempts">
                    <button type="button" onClick={() => handleTimesChange(-1)}>
                      -
                    </button>
                    <p>{currentRecord.times}</p>
                    <button type="button" onClick={() => handleTimesChange(1)}>
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="upload-form-details">
              <div className="upload-form-hori-div">
                <div className="upload-form-hori-div-hori">
                  <p className="upload-steps">6</p>
                  <p className="upload-steps-title">路線類型</p>
                </div>
                <div className="upload-steps-route-types">
                  {routeTypes.map((type) => (
                    <div
                      key={type.name}
                      className={`route-type ${
                        currentRecord.types.includes(type.name)
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => toggleRouteType(type.name)}
                    >
                      <img src={type.icon} alt={type.name} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="upload-form-details">
              <div className="upload-form-hori-div">
                <div className="upload-form-hori-div-hori">
                  <p className="upload-steps">7</p>
                  <p className="upload-steps-title">上傳圖片 / 影片</p>
                </div>
                <div className="upload-form-hori-div-vert">
                  <div className="files-input">
                    <input
                      type="file"
                      name="files"
                      multiple
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="upload-form-details">
              <div className="upload-form-hori-div">
                <div className="upload-form-hori-div-hori">
                  <p className="upload-steps">8</p>
                  <p className="upload-steps-title">備註</p>
                </div>
                <div className="upload-form-hori-div-vert">
                  <textarea
                    className="upload-form-memo"
                    name="memo"
                    rows="3"
                    value={currentRecord.memo}
                    onChange={handleRecordChange}
                    placeholder="例：心得 / 取名 / 困難點 / 跟誰一起 / 定線員 ... ( 非必填 )"
                    maxLength={100}
                  ></textarea>
                </div>
              </div>
            </div>
            <div className="upload-button-div">
              <button type="submit" className="upload-button">
                上傳
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default Upload;
