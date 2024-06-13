import React, { useState } from "react";
import "./stylesheets/Upload.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Upload = () => {
    const [file, setFile] = useState(null);
    const [description, setDescription] = useState("");
    const [climbDate, setClimbDate] = useState(new Date());
    const options = ["市民", "永運", "奇岩"];
    const [selectedOption, setSelectedOption] = useState(options[0]);

    const handleChange = (e) => {
        setSelectedOption(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("file", file);
        formData.append("description", description);

        try {
            const response = await fetch("http://localhost:7000/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            console.log("File uploaded successfull: ", data);
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
                            <DatePicker className="upload-form-hori-div-vert-date" selected={climbDate} onChange={(date) => setClimbDate(date)} dateFormat="yyyy/MM/dd" /> 
                        </div>
                    </div>
                    <div className="upload-form-hori-div">
                        <div className="upload-form-hori-div-hori">
                            <p className="upload-steps">2</p>
                            <p className="upload-steps-title">選擇岩館</p>
                        </div>
                        <div className="upload-form-hori-div-vert">
                            <select className="upload-form-hori-div-vert-select" value={selectedOption} onChange={handleChange}>
                                {options.map((option, index) => (
                                    <option key={index} value={option}>
                                        {option}
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
                    <div className="upload-form-routes-div">
                        <div className="upload-form-route">1</div>
                    </div>
                </div>
                {/* <textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter description"    
                /> */}
                
                {/* <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    placeholder="Enter description"
                /> */}
                <div className="upload-button-div">
                    <button type="submit" className="upload-button">上傳</button>
                </div>
            </form>
        </div>
    )
};

export default Upload;