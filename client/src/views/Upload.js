import React, { useState, useEffect } from "react";
import axios from "axios";
// import { jwtDecode } from "jwt-decode";
import { getUserFromToken } from "../utils/token"
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
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentRecord, setCurrentRecord] = useState({});
  const [showSecondPart, setShowSecondPart] = useState(false);

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

    // const getCookie = (name) => {
    //   const cookieArr = document.cookie.split("; ");
    //   for (let i = 0; i < cookieArr.length; i++) {
    //     const cookiePair = cookieArr[i].split("=");
    //     if (name === cookiePair[0]) {
    //       return decodeURIComponent(cookiePair[1]);
    //     }
    //   }
    //   return null;
    // };

    // const token = getCookie("token");

    // if (!token) {
    //   console.error("No token found");
    //   return;
    // }

    // const decoded = jwtDecode(token);
    // setUserId(decoded.userId);

    const user = getUserFromToken();
    if (user) {
      setUserId(user.userId);
      // console.log("userId: ", user.userId);
    } else {
      console.error("No user found");
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
    setShowSecondPart(true);
    setCurrentRecord({
      wall: "",
      level: "",
      types: [],
      times: 1,
      memo: "",
      files: [],
    });
  };

  const handleSaveRecord = () => {
    if (!currentRecord.level) {
      alert("請選擇難度等級");
      return;
    }

    setRecords([...records, currentRecord]);
    setShowForm(false);
    setShowSecondPart(false);
    setCurrentRecord({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedGym) {
      alert("請選擇岩館！");
      return;
    }

    if (!records[0]) {
      alert("請新增至少一個路線紀錄！");
      return;
    }

    for (let record of records) {
      if (!record.level) {
        alert("請選擇每個路線的難度等級！");
        return;
      }
    }

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("date", climbDate.toISOString());
    formData.append("gymName", selectedGym);
    formData.append(
      "records",
      JSON.stringify(
        records.map((record) => ({
          wall: record.wall,
          level: record.level,
          types: record.types,
          times: record.times,
          memo: record.memo,
        }))
      )
    );

    records.forEach((record) => {
      record.files.forEach((file) => {
        formData.append("files", file);
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
        // console.log("Records uploaded successfully: ", response.data);
        showMessage("紀錄上傳成功！", "success");
        // navigate("/personal");
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
          <div className={`first-part ${showSecondPart ? "hidden" : ""}`}>
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
              <div className="upload-form-hori-div3">
                <div className="upload-form-hori-div-hori">
                  <p className="upload-steps">3</p>
                  <p className="upload-steps-title">路線紀錄 ( 最多 10 個 )</p>
                </div>
              </div>
              {records.map((record, index) => (
                <div key={index} className="upload-form-route-div-summary">
                  <div className="upload-form-route-div-wall-summary">
                    <span className="upload-form-route-div-level">
                      {record.level}
                    </span>
                    <span>類型：{record.types.join(", ")}</span>
                    <span>嘗試次數：{record.times}</span>
                  </div>
                </div>
              ))}
              {records.length < 10 && (
                <div className="add-record-div">
                  <button
                    type="button"
                    onClick={addRecord}
                    className="add-record-button"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
            <div className="upload-button-div">
              <button type="submit" className="upload-button">
                上傳
              </button>
            </div>
          </div>
          <div className={`second-part ${showSecondPart ? "" : "hidden"}`}>
            {showForm && (
              <div className="upload-form-details-containers">
                <div className="upload-form-hori">
                  <div className="upload-form-hori-div">
                    <div className="upload-form-hori-div-hori">
                      <p className="upload-steps">1</p>
                      <p className="upload-steps-title">牆面</p>
                    </div>
                    <div className="upload-form-hori-div-vert">
                      <input
                        type="text"
                        name="wall"
                        value={currentRecord.wall || ""}
                        onChange={handleRecordChange}
                        placeholder="牆面編號 ( 非必填 )"
                        className="wall-input"
                        required
                      />
                    </div>
                  </div>
                  <div className="upload-form-hori-div">
                    <div className="upload-form-hori-div-hori">
                      <p className="upload-steps">2</p>
                      <p className="upload-steps-title">嘗試次數</p>
                    </div>
                    <div className="upload-form-hori-div-vert">
                      <div className="attempts">
                        <button
                          type="button"
                          onClick={() => handleTimesChange(-1)}
                        >
                          -
                        </button>
                        <p>{currentRecord.times}</p>
                        <button
                          type="button"
                          onClick={() => handleTimesChange(1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="upload-form-details">
                  <div className="upload-form-hori-div">
                    <div className="upload-form-details-one">
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

                <div className="upload-form-details">
                  <div className="upload-form-hori-div">
                    <div className="upload-form-details-one">
                      <p className="upload-steps">4</p>
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
                    <div className="upload-form-details-one">
                      <p className="upload-steps">5</p>
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
                    <div className="upload-form-details-one">
                      <p className="upload-steps">6</p>
                      <p className="upload-steps-title">備註</p>
                    </div>
                    <div className="upload-form-hori-div-vert">
                      <textarea
                        name="memo"
                        rows="3"
                        value={currentRecord.memo || ""}
                        onChange={handleRecordChange}
                        placeholder="例：心得 / 取名 / 困難點 / 跟誰一起 / 定線員 ... ( 非必填 )"
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="second-part-buttons">
                  <button
                    type="button"
                    onClick={handleSaveRecord}
                    className="save-record-button"
                  >
                    儲存
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSecondPart(false)}
                    className="cancel-button"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default Upload;
