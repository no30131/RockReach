import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./stylesheets/Upload.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const routeTypes = [
  { name: "Crimpy", icon: "/images/icon_crimpy.png" },
  { name: "Dyno", icon: "/images/icon_dyno.png" },
  { name: "Slope", icon: "/images/icon_slope.png" },
  { name: "Power", icon: "/images/icon_power.png" },
  { name: "Pump", icon: "/images/icon_pump.png" },
];

const difficultyLevels = ["V0", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9"];

const Upload = () => {
  const [climbDate, setClimbDate] = useState(new Date());
  const [gyms, setGyms] = useState([]);
  const [selectedGym, setSelectedGym] = useState("");
  const [userId, setUserId] = useState(null);
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false); // 控制詳情編輯表單的顯示
  const [currentRecord, setCurrentRecord] = useState({}); // 保存當前編輯的記錄

  useEffect(() => {
    const fetchGyms = async () => {
      try {
        const response = await axios.get(`https://node.me2vegan.com/api/gyms/all`);
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

    if (!token) {
      console.error("No token found");
      return;
    }

    const decoded = jwtDecode(token);
    setUserId(decoded.userId);
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
    setCurrentRecord({ ...currentRecord, files: Array.from(files).slice(0, 5) });
  };

  const handleLevelChange = (level) => {
    setCurrentRecord({ ...currentRecord, level });
  };

  const handleTimesChange = (delta) => {
    const newTimes = Math.max(0, currentRecord.times + delta);
    setCurrentRecord({ ...currentRecord, times: newTimes });
  };

  const toggleRouteType = (type) => {
    const newTypes = currentRecord.types.includes(type)
      ? currentRecord.types.filter((t) => t !== type)
      : [...currentRecord.types, type];
    setCurrentRecord({ ...currentRecord, types: newTypes });
  };

  const addRecord = () => {
    setShowForm(true);
    setCurrentRecord({ wall: "", level: "", types: [], times: 0, memo: "", files: [] });
  };

  const handleSaveRecord = () => {
    if (!currentRecord.level) {
      alert("請選擇難度等級");
      return;
    }

    setRecords([...records, currentRecord]);
    setShowForm(false);
    setCurrentRecord({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedGym) {
      alert("請選擇岩館");
      return;
    }

    // 檢查每個記錄是否都有選擇難度等級
    for (let record of records) {
      if (!record.level) {
        alert("請選擇每個路線的難度等級");
        return;
      }
    }

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("date", climbDate.toISOString());
    formData.append("gymName", selectedGym);

    records.forEach((record, index) => {
      const recordData = {
        wall: record.wall,
        level: record.level,
        types: record.types,
        times: record.times,
        memo: record.memo,
      };
      console.log("recordData: ", recordData);
      formData.append(`records[${index}][data]`, JSON.stringify(recordData));
      console.log("formData: ", formData);

      record.files.forEach((file, fileIndex) => {
        formData.append(`records[${index}][files][${fileIndex}]`, file);
      });
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
        console.log("Records uploaded successfully: ", response.data);
        // navigate("/personal");
      } else {
        console.error("Error uploading records: ", response.data);
      }
    } catch (error) {
      console.error("Error uploading file: ", error);
    }
  };

  return (
    <div>
      {!userId ? (
        <p>請先登入！</p>
      ) : (
        <form onSubmit={handleSubmit} className="upload-form">
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
          <div className="upload-form-routes">
            <div className="upload-form-hori-div">
              <div className="upload-form-hori-div-hori">
                <p className="upload-steps">3</p>
                <p className="upload-steps-title">路線紀錄</p>
              </div>
            </div>
            {records.map((record, index) => (
              <div key={index} className="upload-form-route-div-summary">
                <div className="upload-form-route-div-wall-summary">
                  <span className="upload-form-route-div-level">{record.level}</span>
                  <span>類型：{record.types.join(", ")}</span>
                  <span>嘗試次數：{record.times}</span>
                </div>
              </div>
            ))}
            {records.length < 10 && (
              <button type="button" onClick={addRecord} className="add-record-button">
                +
              </button>
            )}
          </div>
          {showForm && (
            <div className="upload-form-details">
              <div className="section">
                <p>路線難度等級*：</p>
                <div className="difficulty-levels">
                  {difficultyLevels.map((level) => (
                    <button
                      type="button"
                      key={level}
                      className={currentRecord.level === level ? "selected" : ""}
                      onClick={() => handleLevelChange(level)} // 處理難度等級變更
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
              <div className="route-types">
                <p>路線類型：</p>
                {routeTypes.map((type) => (
                  <div
                    key={type.name}
                    className={`route-type ${currentRecord.types.includes(type.name) ? "selected" : ""}`}
                    onClick={() => toggleRouteType(type.name)}
                  >
                    <img src={type.icon} alt={type.name} />
                  </div>
                ))}
              </div>
              <div className="section">
                <p>嘗試次數*：</p>
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
              <div className="section">
                <p>備註（例：心得 / 取名 / 困難點 / 跟誰一起 / 定線員）：</p>
                <textarea
                  name="memo"
                  rows="3"
                  value={currentRecord.memo}
                  onChange={handleRecordChange}
                  placeholder="Memo"
                ></textarea>
              </div>
              <div className="section">
                <p>上傳文件：</p>
                <input
                  type="file"
                  name="files"
                  multiple
                  onChange={handleFileChange}
                />
              </div>
              <button type="button" onClick={handleSaveRecord} className="save-record-button">
                儲存
              </button>
            </div>
          )}
          <div className="upload-button-div">
            <button type="submit" className="upload-button">
              上傳
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Upload;
