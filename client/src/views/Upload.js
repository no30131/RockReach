import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./stylesheets/Upload.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const routeTypes = [
    { name: "Crimpy", icon: "../crimpyIcon.png" },
    { name: "Dyno", icon: "../dynoIcon.png" },
    { name: "Slope", icon: "../slopeIcon.png" },
    { name: "Power", icon: "../powerIcon.png" },
    { name: "Pump", icon: "../pumpIcon.png" }
];

const Upload = () => {
    const [climbDate, setClimbDate] = useState(new Date());
    const [gyms, setGyms] = useState([]);
    const [selectedGym, setSelectedGym] = useState("");
    const [records, setRecords] = useState([{ wall: "", level: "", types: [], times: 0, memo: "", files: [] }]);
    const navigate = useNavigate();
    
    useEffect(() => {
        const fetchGyms = async () => {
            try {
                const response = await fetch("http://localhost:7000/api/gyms/all")
                const data = await response.json();
                setGyms(data);
                setSelectedGym(data[0]?._id || "");
            } catch (error) {
                console.error("Error fetching gyms: ", error);
            }
        };

        fetchGyms();
    }, []);

    const handleChange = (e) => {
        setSelectedGym(e.target.value);
    };

    const handleRecordChange = (index, e) => {
        const { name, value } = e.target;
        const updatedRecords = records.map((record, i) => (
            i === index ? { ...record, [name]: value } : record
        ));
        setRecords(updatedRecords);
    };

    const handleFileChange = (index, e) => {
        const files = e.target.files;
        const updatedRecords = records.map((record, i) => (
            i === index ? { ...record, files: Array.from(files).slice(0, 5) } : record
        ));
        setRecords(updatedRecords);
    }

    const toggleRouteType = (recordIndex, type) => {
        const updatedRecords = records.map((record, i) => {
            if (i === recordIndex) {
                const newTypes = record.types.includes(type)
                    ? record.types.filter(t => t !== type)
                    : [...record.types, type];
                return { ...record, types: newTypes };
            }
            return record;
        });
        setRecords(updatedRecords);
    }

    const addRecord = () => {
        setRecords([...records, { wall: "", level: "", types: [], times: 0, memo: "", files: [] }])
    }

    const getCookie = (name) => {
        const cookieArr = document.cookie.split("; ");
        for (let i = 0; i < cookieArr.length; i++) {
            const cookiePair = cookieArr[i].split("=");
            if (name === cookiePair[0]) {
                return decodeURIComponent(cookiePair[1]);
            }
        }
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = getCookie("token");

        if (!token) {
            console.error("No token found");
            return;
        }

        const decoded = jwtDecode(token);
        const userId = decoded.userId;

        const formData = new FormData();
        formData.append("userId", userId);
        formData.append("date", climbDate.toISOString());
        formData.append("gymName", selectedGym);

        const recordsData = records.map(record => ({
            wall: record.wall,
            level: record.level,
            types: record.types,
            times: record.times,
            memo: record.memo,
            files: []
        }));
        formData.append("records", JSON.stringify(recordsData));

        records.forEach(record => {
            Array.from(record.files).forEach(file => {
                formData.append(`files`, file);
                // formData.append(`records[${index}][files][${fileIndex}]`, file);
            });
        });
        // console.log("formData: ", formData);
        try {
            const response = await fetch("http://localhost:7000/api/climbRecords/create", {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            if (response.ok) {
                console.log("Records uploaded successfully: ", data);
                // navigate("/personal");
            } else {
                console.error("Error uploading records: ", data);
            }
        } catch (error) {
            console.error("Error uploading file: ", error);
        }
    };

    return (
        <div>
            <h1>新增攀岩紀錄</h1>
            <form onSubmit={handleSubmit} className="upload-form">
                <div className="upload-form-hori">
                    <div className="upload-form-hori-div">
                        <div className="upload-form-hori-div-hori">
                            <p className="upload-steps">1</p>
                            <p className="upload-steps-title">選擇日期</p>
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
                            <p className="upload-steps-title">選擇岩館</p>
                        </div>
                        <div className="upload-form-hori-div-vert">
                            <select 
                                className="upload-form-hori-div-vert-select" 
                                value={selectedGym} 
                                onChange={handleChange}
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
                        <div key={index} className="upload-form-route-div">
                            <input
                                type="text"
                                name="wall"
                                value={record.wall}
                                onChange={(e) => handleRecordChange(index, e)}
                                placeholder="Wall"
                                required
                            />
                            <input
                                type="text"
                                name="level"
                                value={record.level}
                                onChange={(e) => handleRecordChange(index, e)}
                                placeholder="Level"
                                required
                            />
                            <div className="route-types">
                                {routeTypes.map((type) =>(
                                    <div
                                        key={type.name}
                                        className={`route-type ${record.types.includes(type.name) ? "selected" : ""}`}
                                        onClick={() => toggleRouteType(index, type.name)}
                                    >
                                        <img src={type.icon} alt={type.name} />
                                    </div>
                                ))}
                            </div>
                            <input
                                type="number"
                                name="times"
                                value={record.times}
                                onChange={(e) => handleRecordChange(index, e)}
                                placeholder="Times"
                            />
                            <textarea
                                name="memo"
                                value={record.memo}
                                onChange={(e) => handleRecordChange(index, e)}
                                placeholder="Memo"
                            ></textarea>
                            <input
                                type="file"
                                name="files"
                                multiple
                                onChange={(e) => handleFileChange(index, e)}
                            />
                        </div>
                    ))}
                    {records.length < 10 && (
                        <button type="button" onClick={addRecord}>
                            新增路線紀錄
                        </button>
                    )}
                </div>
                <div className="upload-button-div">
                    <button type="submit" className="upload-button">上傳</button>
                </div>
            </form>
        </div>
    )
};

export default Upload;